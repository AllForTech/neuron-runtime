'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { signInWithGithub } from '@/lib/auth/auth';
import { Zap, Github, Chrome, ArrowRight, ShieldCheck } from 'lucide-react';
import {useRouter} from "next/navigation";

export function AuthForm({ className, ...props }: React.ComponentProps<'div'>) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignIn = async (provider: 'github' | 'google') => {
        setLoading(true);
        // Logic for provider-specific sign in
        await signInWithGithub();

        // router.refresh();
        setLoading(false);
    };

    return (
        <div className={cn('flex flex-col gap-5 w-full max-w-[400px]', className)} {...props}>
            {/* Branding Section */}
            <div className="flex flex-col items-center gap-2 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)] border border-white">
                    <Zap className="h-6 w-6 text-black fill-black" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white mt-2">Neuron</h1>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-[0.3em]">
                    Logical Workflow
                </p>
            </div>

            <Card className="border-white/[0.08] p-0! bg-neutral-900/40 backdrop-blur-2xl shadow-2xl rounded-[32px] overflow-hidden">
                <CardHeader className="pt-4 pb-4 text-center">
                    <CardTitle className="text-2xl font-semibold tracking-tight text-white">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-neutral-400">
                        Securely access your neural workflows.
                    </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-3 p-7 pt-0!">
                    <div className="grid gap-3">
                        <Button
                            disabled={true}
                            variant="outline"
                            type="button"
                            onClick={() => handleSignIn('google')}
                            className="h-12 rounded-xl border-white/[0.05] bg-white/[0.10]! hover:bg-white! hover:text-black! transition-300! gap-3 font-medium"
                        >
                            <Chrome className="h-4 w-4" />
                            Continue with Google
                        </Button>

                        <Button
                            disabled={loading}
                            variant="outline"
                            type="button"
                            onClick={() => handleSignIn('github')}
                            className="h-12 rounded-xl border-white/[0.05] bg-white/[0.10]! hover:bg-white! hover:text-black! transition-300! gap-3 font-medium"
                        >
                            <Github className="h-4 w-4" />
                            Continue with GitHub
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/[0.05]" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-neutral-900/40 px-3 text-neutral-600 backdrop-blur-xl">
                Cloud Verification
              </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            variant="link"
                            className="text-neutral-400 hover:text-white text-xs group transition-colors"
                            asChild
                        >
                            <a href="#" className="flex items-center gap-2">
                                New to Neuron? Create an account <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Trust Footer */}
            <div className="flex flex-col items-center gap-4 px-4 text-center">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.05] bg-white/[0.02]">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
            AES-256 Encrypted Connection
          </span>
                </div>

                <p className="text-[11px] leading-relaxed text-neutral-500 max-w-[280px]">
                    By continuing, you agree to Neuron’s{' '}
                    <a href="#" className="text-neutral-300 hover:underline hover:text-white! decoration-white/20 underline-offset-4">Terms</a> and{' '}
                    <a href="#" className="text-neutral-300 hover:underline hover:text-white! decoration-white/20 underline-offset-4">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
}