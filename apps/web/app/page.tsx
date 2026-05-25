'use client'

import { SceneView } from '@/components/landing/SceneView'
import { SystemElasticityView } from '@/components/landing/system-elasticity/system-elasticity-view'
import {IdentityView} from "@/components/landing/identity/identity-view";
import { SceneRuntime } from "@/providers/landing/SceneRuntimeProvider";
import { ScrollRuntimeProvider } from "@/providers/landing/ScrollRuntimeProvider";
import {useSceneRuntime} from "@/hooks/landing/useSceneRuntime";
import {CoordinationView} from "@/components/landing/coordination/coordination-view";
import {InfrastructureView} from "@/components/landing/infrastructure/infrastructure-view";
import {NavigationOverlay} from "@/components/landing/NavigationOverlay";
import {RuntimeBackground} from "@/components/landing/background";
import {ViewIndicator} from "@/components/landing/ViewIndicator";

export default function Page() {
    const { runtime, goToScene, handleScroll } = useSceneRuntime()

    return (
        <ScrollRuntimeProvider onScroll={handleScroll}>
            <SceneRuntime runtime={runtime}>
                {/* Identity Scene */}
                <SceneView sceneIndex={0}>
                    <IdentityView />
                </SceneView>

                {/* Connectivity and  Scene */}
                <SceneView sceneIndex={1}>
                    <CoordinationView />
                </SceneView>


                {/* Infrastructure Scene */}
                <SceneView sceneIndex={2}>
                    <InfrastructureView />
                </SceneView>

                {/* Cards Scene */}
                <SceneView sceneIndex={3}>
                    <SystemElasticityView />
                </SceneView>

                {/* Navigation Overlay */}
                <NavigationOverlay onSceneChange={goToScene} />
                <RuntimeBackground/>

                {/* View Indicator */}
                <ViewIndicator onSceneChange={goToScene} />
            </SceneRuntime>
        </ScrollRuntimeProvider>
    )
}
