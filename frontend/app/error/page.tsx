export default function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="text-red-500 mb-4">
          {/* アイコンなどを追加できます */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10c0 4.418-3.582 8-8 8S2 14.418 2 10 5.582 2 10 2s8 3.582 8 8zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm0 4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h1>
        <p className="text-gray-600 mb-4">We apologize for the inconvenience. Please try again later.</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-indigo-500 text-white text-sm font-medium rounded-lg shadow hover:bg-indigo-600 transition duration-200"
        >
          Go back to Home
        </a>
      </div>
    </div>
  );
}