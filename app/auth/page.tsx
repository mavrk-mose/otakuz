import { AuthForm } from "@/components/auth/auth-form";
import Image from "next/image";

export default function Auth() {
    return (
        <div className="font-[sans-serif] min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Image */}
            <Image
                src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Background"
                width={100}
                height={400}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay (Optional for better contrast) */}
            <div className="absolute inset-0 bg-black/45 dark:bg-black/60"></div>

            {/* Sign-in Box */}
            <div className="relative z-10 w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-xl">
                <AuthForm />
            </div>
        </div>
    );
}
