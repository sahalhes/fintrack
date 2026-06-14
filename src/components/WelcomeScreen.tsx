'use client';

import Link from 'next/link';

const WelcomeScreen = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg dark:shadow-neutral-900/50 p-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👋</div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-neutral-100 mb-4">Welcome to Personal Finance Tracker!</h1>
          <p className="text-lg text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Take control of your finances with a simple, private, and secure balance sheet tracker
            that keeps all your data local to your browser.
          </p>
        </div>

        {/* Privacy Banner */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-6 mb-8">
          <div className="flex items-center justify-center">
            <div className="flex-shrink-0">
              <span className="text-2xl mr-3">🔒</span>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-medium text-green-800 dark:text-green-300">100% Private & Secure</h2>
              <p className="mt-1 text-green-700 dark:text-green-400">
                Your financial data stays on your device. No servers, no accounts, no data sharing.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Start Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Step 1 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-center">
            <div className="text-3xl mb-4">1️⃣</div>
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Add Accounts</h3>
            <p className="text-blue-700 dark:text-blue-400 mb-4 text-sm">
              Create accounts for your assets, liabilities, and equity.
            </p>
            <Link
              href="/add-account"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors inline-block"
            >
              Add Your First Account
            </Link>
          </div>

          {/* Step 2 */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 text-center">
            <div className="text-3xl mb-4">2️⃣</div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3">Record Balances</h3>
            <p className="text-green-700 dark:text-green-400 mb-4 text-sm">
              Enter current balances for tracking over time.
            </p>
            <Link
              href="/record-balances"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors inline-block"
            >
              Record Balances
            </Link>
          </div>

          {/* Step 3 */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 text-center">
            <div className="text-3xl mb-4">3️⃣</div>
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-3">Track Progress</h3>
            <p className="text-purple-700 dark:text-purple-400 mb-4 text-sm">
              View charts and track your net worth over time.
            </p>
            <Link
              href="/historical"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors inline-block"
            >
              View Tracking
            </Link>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-gray-50 dark:bg-neutral-700/50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-100 mb-4 text-center">✨ Key Features</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-neutral-300">
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="mr-2">📊</span>
                <span>Complete balance sheet view</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📈</span>
                <span>Historical progress tracking</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">💰</span>
                <span>Multiple account categories</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="mr-2">🔒</span>
                <span>Complete privacy & security</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📤</span>
                <span>Easy data export/import</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📱</span>
                <span>Mobile-friendly design</span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-8">
          <div className="flex items-start">
            <span className="text-lg mr-2">💡</span>
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">Important:</h3>
              <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                All your data is stored locally in this browser. Make sure to export your data regularly
                from the Settings page to prevent data loss if you clear your browser data.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/add-account"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors text-center flex-1"
          >
            🚀 Get Started - Add Account
          </Link>
          <Link
            href="/disclaimer"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-medium transition-colors text-center"
          >
            📋 Privacy Info
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
