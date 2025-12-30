"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CatalogHeading() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Force re-render on mount
    setShow(false);
    setTimeout(() => setShow(true), 0);
  }, []);

  return (
    <div className="mb-8 text-center">
      {show && (
        <>
          <h1
            className="text-5xl font-bold"
            style={{
              color: '#fbbf24',
              display: 'block',
              opacity: 1,
              visibility: 'visible'
            }}
          >
            Find Your Mentor
          </h1>
          <p className="text-white/60 text-lg mt-2">
            Or{' '}
            <Link href="/apply" className="text-yellow-400 hover:text-yellow-300 transition-colors">
              Become a Mentor
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
