"use client";

import { useEffect, useState } from "react";

export default function CatalogHeading() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Force re-render on mount
    setShow(false);
    setTimeout(() => setShow(true), 0);
  }, []);

  return (
    <div className="mb-8">
      {show && (
        <h1
          className="text-5xl font-bold text-center"
          style={{
            color: '#fbbf24',
            display: 'block',
            opacity: 1,
            visibility: 'visible'
          }}
        >
          Find Your Mentor
        </h1>
      )}
    </div>
  );
}
