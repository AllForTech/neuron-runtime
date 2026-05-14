import { HeroSection } from '@/components/layout/hero/HeroSection';
import { Navbar } from '@/components/layout/hero/Navbar';
import { Footer } from '@/components/layout/footer/Footer';
import NeuronPipelineSection from '@/components/layout/neuron/NeuronPipelineSection';
import ExecutionPipeline from "@/components/landing-page/execution-pipeline";
import ConnectiveIntelligence from "@/components/landing-page/connective-intelligence";
import {OrchestrationModel} from "@/components/landing-page/orchestration-model";

export default function Home() {
    return (
        <>
            <Navbar />
            <HeroSection />
            <ExecutionPipeline />
            <OrchestrationModel />
            <ConnectiveIntelligence />
            <NeuronPipelineSection />
            <Footer />
        </>
    );
}