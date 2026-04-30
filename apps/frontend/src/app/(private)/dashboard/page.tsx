"use client";

import {
  LayoutDashboard,
  User,
  ShieldCheck,
  LogOut,
  RefreshCcw,
  Database,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useauth";
// import { federatedLogout } from "@/actions/logout";
import { federatedLogout } from "@/lib/actions/logout";

export default function DashboardHome() {
  // Pull data directly from our TanStack-powered hook
  const { user, status: authStatus, error } = useUser();

  // 1. Loading State
  if (authStatus === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCcw className="mx-auto h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-2 text-sm text-gray-500">Fetching your profile...</p>
        </div>
      </div>
    );
  }

  // 2. Stale/Error State (Poisoned token handled here)
  if (authStatus === "stale") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-lg border border-red-100">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Session Expired
          </h2>
          <p className="mt-2 text-gray-500">
            Your security token is no longer valid. Please sign in again to
            continue.
          </p>
          <button
            onClick={async () => {
              const url = await federatedLogout();
              if (url) window.location.href = url;
            }}
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header Section */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-blue-600" />
            Project NetHub
          </h1>
          <p className="text-gray-500">
            Welcome back,{" "}
            <span className="font-semibold text-gray-700">
              {user?.full_name}
            </span>
          </p>
        </div>

        <button
          onClick={async () => {
            const url = await federatedLogout();
            if (url) window.location.href = url;
          }}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm border border-gray-200 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Profile Card - Data from FastAPI /me */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <User className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Account Info
            </h2>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-gray-500">
              Email:{" "}
              <span className="text-gray-900 font-medium">{user?.email}</span>
            </p>
            <p className="text-gray-500">
              Full Name:{" "}
              <span className="text-gray-900 font-medium">
                {user?.full_name}
              </span>
            </p>
          </div>
        </div>

        {/* Backend Metadata Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-full bg-purple-100 p-3 text-purple-600">
              <Database className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Identity Context
            </h2>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-gray-500">
              Internal ID:{" "}
              <code className="bg-gray-50 px-1 rounded text-purple-700 text-xs">
                {user?.id}
              </code>
            </p>
            <p className="text-gray-500">
              Tenant:{" "}
              <span className="text-gray-900 font-medium">
                {user?.tenant_id}
              </span>
            </p>
            <p className="text-gray-500">
              Status:{" "}
              <span
                className={user?.is_active ? "text-green-600" : "text-red-600"}
              >
                {user?.is_active ? "Active" : "Inactive"}
              </span>
            </p>
          </div>
        </div>

        {/* Security / Token Status Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-full bg-green-100 p-3 text-green-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Session Status
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full animate-pulse ${authStatus === "authenticated" ? "bg-green-500" : "bg-yellow-500"}`}
            />
            <span className="text-sm font-medium text-gray-700 capitalize">
              {authStatus}
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Real-time sync active with NetHub Identity Proxy.
          </p>
        </div>
      </div>

      {/* Debug Info (Only in Dev) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-12 rounded-lg bg-gray-900 p-6 text-white overflow-x-auto shadow-2xl">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">
            TanStack User Cache (FastAPI /me)
          </h3>
          <pre className="text-xs font-mono text-blue-300">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}