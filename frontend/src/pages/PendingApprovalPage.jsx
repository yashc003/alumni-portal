import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Hourglass } from 'lucide-react';

/*
 * ============================================================
 * ⏳ PendingApprovalPage.jsx — The Waiting Room
 * ============================================================
 */

export function PendingApprovalPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 text-gray-900">
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm max-w-md w-full text-center">
                
                {/* A nice pulsing icon to indicate waiting */}
                <div className="w-20 h-20 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 relative border border-yellow-100">
                    <div className="absolute inset-0 bg-yellow-100 rounded-full animate-ping opacity-50"></div>
                    <Hourglass size={40} className="relative z-10" />
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Account Pending Approval
                </h1>
                
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Your application has been received successfully! For security reasons, 
                    a Class Coordinator must review and approve your account before you can log in.
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 text-sm text-left">
                    <p className="text-gray-700 font-medium mb-1">What happens next?</p>
                    <ul className="text-gray-500 list-disc list-inside space-y-1">
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
