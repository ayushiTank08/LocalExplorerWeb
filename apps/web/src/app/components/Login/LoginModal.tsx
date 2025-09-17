"use client";

import { useEffect, useState } from "react";
import { Button } from "@nextforge/ui";
import { apiRequest } from "@/utils/api";
import CryptoJS from 'crypto-js';
import { toast } from 'react-hot-toast';
import { useNotifications } from "@/hooks/useNotifications";

// const ENCRYPTION_KEY = '9ec52ebdeac36c4dc2c4fcdf5988b7d4';
// const ENCRYPTION_IV = 'U1MV7WIMbz0EcAC1';
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || '';
const ENCRYPTION_IV = process.env.NEXT_PUBLIC_ENCRYPTION_IV || '';
 
const encryptData = (data: string): string => {
  try {
    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
    const iv = CryptoJS.enc.Utf8.parse(ENCRYPTION_IV);
    
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(data),
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess?: (userData: any) => void;
}

interface LoginResponse {
  Status: number;
  Message: string;
  Data: {
    Token: string;
    UserUniqueId: number;
    FirstName: string;
    LastName: string;
    Email: string;
    ProfileURL: string;
  };
}

export function LoginModal({ onClose, onLoginSuccess }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();

  useEffect(() => {
    setTimeout(() => setIsOpen(true), 50);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!email || !password) {
        notifyError('Validation Error', 'Please enter both email and password');
        return;
      }

      const encryptedEmail = encryptData(email);
      const encryptedPassword = encryptData(password);
      
      const loadingNotification = notifyInfo('Signing in', 'Please wait while we sign you in...');
      
      let response;
      try {
        response = await apiRequest<LoginResponse>({
        url: 'http://tsunamistagingv2api.azurewebsites.net/api/Common/Login',
        method: 'PUT',
        body: {
          customerId: 5588,
          uniqueId: '5112d4b1-419c-4ed0-bd58-9a6ba3f4e363',
          email: encryptedEmail,
          password: encryptedPassword,
          oldPassword: null,
          externalLogin: false,  
          userUniqueId: 0,
          userType: null,
          externalLoginType: null,
          externalLoginId: null,
          accessToken: null,
          externalProfileURL: null,
          firstName: null,
          lastName: null,
          gender: null,
          neonMembershipId: 0,
          osVersion: null,
          modelNumber: 0,
          appVersion: null,
          tourDePearlRegId: 0,
          neonPaymentStatus: null,
          neonAutoRenew: false,
          expiryDate: '0001-01-01T00:00:00',
          showLeaderBoardBrewery: false,
          appType: 1,
          appName: 'Marion County',
          deviceTokenId: '',
          deviceType: 'WEB',
          isOldApp: false,
          isMigrated: null,
          isAutoLogin: false
        },
        });
      } finally {
        toast.dismiss(loadingNotification);
      }

      if (response.Status === 200) {
        localStorage.setItem('authToken', response.Data.Token);
        localStorage.setItem('userData', JSON.stringify(response.Data));
        
        notifySuccess('Welcome back!', 'You have successfully signed in.');
        
        onLoginSuccess?.(response.Data);
        
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        const errorMessage = response.Message || 'Login failed. Please try again.';
        setError(errorMessage);
        notifyError('Login Failed', errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during login. Please try again.';
      setError(errorMessage);
      notifyError('Login Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-start justify-center z-[9999] pt-60 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-[500px] p-6 relative animate-slideDown"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-center text-xl font-semibold mb-6">Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/90"
          />
        </div>

        <div className="mb-2 relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/90"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
          >
            👁
          </button>
        </div>

        <div className="mb-4 text-sm text-[var(--color-secondary)] cursor-pointer hover:underline">
          Forgot Password?
        </div>

        <Button 
          type="submit"
          className="w-full bg-[#C24B2C] text-white py-2 rounded hover:bg-[#a63f24] cursor-pointer disabled:opacity-50"
          disabled={isLoading || !email || !password}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>

        <div className="text-center mt-4 text-sm">
          Don&apos;t have an account?{" "}
          <span className="text-[var(--color-secondary)] cursor-pointer hover:underline">
            Sign Up
          </span>
        </div>

          <div className="flex justify-center mt-6">
            <Button
              type="button"
              // variant="outline"
              className="px-6 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
