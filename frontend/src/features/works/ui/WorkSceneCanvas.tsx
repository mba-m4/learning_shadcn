import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { getWorkSceneAnnotationColor } from '@/features/works/model/workScene'
import type { WorkSceneAnnotation, WorkSceneAsset } from '@/types/api'

interface Props {
  sceneAsset: WorkSceneAsset
  selectedAnnotationId: string | null
  onSelectAnnotation(annotation: WorkSceneAnnotation): void
}

export function WorkSceneCanvas({ sceneAsset, selectedAnnotationId, onSelectAnnotation }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const selectedAnnotationIdRef = useRef<string | null>(selectedAnnotationId)
  const onSelectAnnotationRef = useRef(onSelectAnnotation)
  const cameraTransitionRef = useRef<{
    active: boolean
    startedAt: number
    durationMs: number
    fromPosition: THREE.Vector3
    toPosition: THREE.Vector3
    fromTarget: THREE.Vector3
    toTarget: THREE.Vector3
  } | null>(null)
  const markerRegistryRef = useRef<
    Map<
      string,
      {
        anchor: THREE.Group
        mesh: THREE.Mesh
        halo: THREE.Mesh
        glow: THREE.PointLight
        annotation: WorkSceneAnnotation
        baseScale: number
      }
    >
  >(new Map())

  useEffect(() => {
    selectedAnnotationIdRef.current = selectedAnnotationId
  }, [selectedAnnotationId])

  useEffect(() => {
    onSelectAnnotationRef.current = onSelectAnnotation
  }, [onSelectAnnotation])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f8fafc')
    scene.fog = new THREE.Fog('#f8fafc', 8, 22)

    const camera = new THREE.PerspectiveCamera(sceneAsset.camera?.fov ?? 30, 1, 0.1, 1000)
    camera.position.set(3.2, 2.5, 4.4)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 1.1
    controls.maxDistance = 10
    controlsRef.current = controls

    const hemiLight = new THREE.HemisphereLight('#ffffff', '#94a3b8', 1.4)
    hemiLight.position.set(0, 5, 0)
    scene.add(hemiLight)

    const directionalLight = new THREE.DirectionalLight('#ffffff', 1.6)
    directionalLight.position.set(5, 8, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(1024, 1024)
    scene.add(directionalLight)

    const fillLight = new THREE.DirectionalLight('#cbd5e1', 0.8)
    fillLight.position.set(-4, 3, -3)
    scene.add(fillLight)

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(9, 48),
      new THREE.MeshStandardMaterial({ color: '#e2e8f0', transparent: true, opacity: 0.6 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.1
    floor.receiveShadow = true
    scene.add(floor)

    const grid = new THREE.GridHelper(12, 12, '#cbd5e1', '#e2e8f0')
    grid.position.y = -1.08
    scene.add(grid)

    const sceneRoot = new THREE.Group()
    const sceneScale = sceneAsset.transform?.scale ?? 1
    const sceneOffset = sceneAsset.transform?.offset ?? { x: 0, y: 0, z: 0 }
    sceneRoot.scale.setScalar(sceneScale)
    sceneRoot.position.set(sceneOffset.x, sceneOffset.y, sceneOffset.z)
    scene.add(sceneRoot)

    const markerGroup = new THREE.Group()
    sceneRoot.add(markerGroup)

    const markerRegistry = markerRegistryRef.current
    markerRegistry.clear()

    sceneAsset.annotations.filter((annotation) => annotation.position).forEach((annotation, index) => {
      const position = annotation.position
      if (!position) {
        return
      }

      const anchor = new THREE.Group()
      anchor.position.set(position.x, position.y, position.z)
      const baseRadius = annotation.size ?? (annotation.kind === 'risk' ? 0.08 : 0.06)

      const color = new THREE.Color(getWorkSceneAnnotationColor(annotation))
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: annotation.kind === 'risk' ? 2.1 : 1.4,
        metalness: 0.2,
        roughness: 0.25,
      })
      const geometry = new THREE.SphereGeometry(baseRadius, 28, 28)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true
      mesh.userData.annotationId = annotation.id

      const glow = new THREE.PointLight(color, annotation.kind === 'risk' ? 4.8 : 3.2, 1.45, 2)

      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(baseRadius * 2, 20, 20),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: annotation.kind === 'risk' ? 0.22 : 0.16,
        }),
      )

      const markerSizeCompensation = 1 / Math.max(sceneScale, 0.001)
      mesh.scale.setScalar(markerSizeCompensation)
      halo.scale.setScalar(markerSizeCompensation)

      anchor.add(mesh)
      anchor.add(glow)
      anchor.add(halo)
      markerGroup.add(anchor)
      markerRegistry.set(annotation.id, {
        anchor,
        mesh,
        halo,
        glow,
        annotation,
        baseScale: markerSizeCompensation * (1 + index * 0.01),
      })
    })

    const loader = new GLTFLoader()
    let disposed = false
    let animationFrameId = 0
    const startedAt = performance.now()
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    const alignGroundToObject = (object: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(object)
      if (box.isEmpty()) {
        return
      }

      const groundY = box.min.y - 0.04
      floor.position.y = groundY
      grid.position.y = groundY + 0.02
    }

    const fitCamera = (object: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(object)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxDimension = Math.max(size.x, size.y, size.z, 2)
      const target = sceneAsset.camera?.target
        ? new THREE.Vector3(sceneAsset.camera.target.x, sceneAsset.camera.target.y, sceneAsset.camera.target.z)
        : center

      controls.target.copy(target)
      if (sceneAsset.camera?.position) {
        camera.position.set(
          sceneAsset.camera.position.x,
          sceneAsset.camera.position.y,
          sceneAsset.camera.position.z,
        )
      } else {
        camera.position.set(center.x + maxDimension * 0.82, center.y + maxDimension * 0.62, center.z + maxDimension * 1.02)
      }
      camera.near = 0.1
      camera.far = maxDimension * 20
      camera.updateProjectionMatrix()
      controls.update()
      cameraTransitionRef.current = null
    }

    const resize = () => {
      const width = container.clientWidth
      const height = Math.max(container.clientHeight, 360)
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const meshes = Array.from(markerRegistry.values()).map((entry) => entry.mesh)
      const intersections = raycaster.intersectObjects(meshes, false)
      const annotationId = intersections[0]?.object.userData.annotationId as string | undefined
      if (!annotationId) {
        return
      }
      const selected = markerRegistry.get(annotationId)?.annotation
      if (selected) {
        onSelectAnnotationRef.current(selected)
      }
    }

    renderer.domElement.addEventListener('click', handleClick)

    const observer = new ResizeObserver(() => {
      resize()
    })
    observer.observe(container)
    resize()

    loader.load(
      sceneAsset.model_url,
      (gltf) => {
        if (disposed) {
          return
        }

        gltf.scene.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true
            node.receiveShadow = true
          }
        })
        sceneRoot.add(gltf.scene)
        alignGroundToObject(gltf.scene)
        fitCamera(sceneRoot)
      },
      undefined,
      () => {
        fitCamera(sceneRoot)
      },
    )

    const animate = () => {
      const elapsed = (performance.now() - startedAt) / 1000
      const activeTransition = cameraTransitionRef.current
      if (activeTransition?.active) {
        const elapsedMs = performance.now() - activeTransition.startedAt
        const progress = Math.min(elapsedMs / activeTransition.durationMs, 1)
        const easedProgress = 1 - (1 - progress) * (1 - progress) * (1 - progress)

        camera.position.lerpVectors(
          activeTransition.fromPosition,
          activeTransition.toPosition,
          easedProgress,
        )
        controls.target.lerpVectors(
          activeTransition.fromTarget,
          activeTransition.toTarget,
          easedProgress,
        )

        if (progress >= 1) {
          cameraTransitionRef.current = null
        }
      }

      markerRegistry.forEach((entry) => {
        const isSelected = selectedAnnotationIdRef.current === entry.annotation.id
        const pulse = 1 + Math.sin(elapsed * (entry.annotation.kind === 'risk' ? 3.2 : 2.4)) * 0.12
        const emphasis = isSelected ? 1.08 : 1
        const scale = pulse * entry.baseScale * emphasis
        entry.mesh.scale.setScalar(scale)
        entry.halo.scale.setScalar(scale * 1.9)
        entry.glow.intensity = isSelected
          ? entry.annotation.kind === 'risk'
            ? 8
            : 6
          : entry.annotation.kind === 'risk'
            ? 4.8
            : 3.2
      })

      controls.update()
      renderer.render(scene, camera)
      animationFrameId = window.requestAnimationFrame(animate)
    }

    animate()

    return () => {
      disposed = true
      window.cancelAnimationFrame(animationFrameId)
      observer.disconnect()
      renderer.domElement.removeEventListener('click', handleClick)
      controls.dispose()
      scene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.geometry.dispose()
          if (Array.isArray(node.material)) {
            node.material.forEach((material) => material.dispose())
          } else {
            node.material.dispose()
          }
        }
      })
      renderer.dispose()
      markerRegistry.clear()
      cameraRef.current = null
      controlsRef.current = null
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [sceneAsset])

  useEffect(() => {
    if (!selectedAnnotationId) {
      return
    }

    const selected = markerRegistryRef.current.get(selectedAnnotationId)
    const camera = cameraRef.current
    const controls = controlsRef.current
    if (!selected || !camera || !controls) {
      return
    }

    const worldPosition = selected.anchor.getWorldPosition(new THREE.Vector3())
    const targetPosition = worldPosition.clone().add(new THREE.Vector3(1.25, 0.9, 1.25))
    cameraTransitionRef.current = {
      active: true,
      startedAt: performance.now(),
      durationMs: 420,
      fromPosition: camera.position.clone(),
      toPosition: targetPosition,
      fromTarget: controls.target.clone(),
      toTarget: worldPosition,
    }
  }, [selectedAnnotationId])

  return <div ref={containerRef} className="h-[420px] w-full overflow-hidden rounded-2xl border border-border/60 bg-slate-100" />
}