import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

/*
 * ============================================================
 * ⏳ PendingApprovalPage.jsx — The Waiting Room
 * ============================================================
 * Users are redirected here if they just registered, or if they
 * tried to log in but their accountStatus is still PENDING.
 * ============================================================
 */

export function PendingApprovalPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg text-slate-200">
            <div className="bg-dark-surface border border-dark-border p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                
                {/* A nice pulsing icon to indicate waiting */}
                <div className="w-20 h-20 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl relative">
                    <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping"></div>
                    <span className="relative z-10">⏳</span>
                </div>
                
                <h1 className="text-2xl font-bold text-white mb-4">
                    Account Pending Approval
                </h1>
                
                <p className="text-slate-400 mb-8 leading-relaxed">
                    Your application has been received successfully! For security reasons, 
                    a Class Coordinator must review and approve your account before you can log in.
                </p>

                <div className="bg-dark-bg border border-dark-border rounded-lg p-4 mb-8 text-sm text-left">
                    <p className="text-slate-300 font-medium mb-1">What happens next?</p>
                    <ul className="text-slate-400 list-disc list-inside space-y-1">
                        <li>The admin team will verify your details.</li>
                        <li>This usually takes 1-2 business days.</li>
                        <li>Try logging in again later.</li>
                    </ul>
                </div>

                <Link to="/login">
                    <Button variant="secondary" className="w-full">
                        Back to Login
                    </Button>
                </Link>
            </div>
        </div>
    );
}
