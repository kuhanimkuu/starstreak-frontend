import React from 'react';
import { PageHero } from '../components/ui/Section';

export default function Licenses() {
  const lastUpdated = "December 8, 2025"; // update as needed

  const licenseGroups = [
    {
      title: "Starstreak Platform License",
      content: `
Copyright © ${new Date().getFullYear()} Hephix Ltd.

Starstreak and all associated branding, designs, software code, logos, trademarks, 
and digital assets are the property of Hephix Ltd. All rights reserved.

No part of the Starstreak platform, website, or mobile application may be reproduced, 
distributed, or reverse engineered without explicit written permission from Hephix Ltd.
      `,
    },
    {
      title: "React (MIT License)",
      content: `
MIT License

Copyright (c) Facebook, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, subject to the following conditions:

(The full MIT license text would go here. You may paste the complete version.)
      `,
    },
    {
      title: "Tailwind CSS (MIT License)",
      content: `
MIT License

Copyright (c) Tailwind Labs, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...

(The full Tailwind MIT license text goes here.)
      `,
    },
    {
      title: "React Icons (MIT License)",
      content: `
MIT License

Copyright (c)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...

(Paste the full MIT text here.)
      `,
    },
    {
      title: "Other Third-Party Packages",
      content: `
This section includes licenses for additional dependencies used in the Starstreak 
web and mobile applications. You may expand this list as new packages are added.

Examples:
- Axios (MIT)
- Zustand or Redux (MIT)
- React Router (MIT)
- Firebase / Supabase SDK (appropriate license)
- Framer Motion (MIT)
- Lodash (MIT)

You can paste each full license text below as needed.
      `,
    },
  ];

  return (
    <div className="min-h-screen">
      <PageHero eyebrow="Legal" title="Licenses & Attributions" intro="This page provides licensing information for Starstreak and the third-party software libraries used within the platform.">
        <p className="mt-6 text-sm text-dust">Last updated {lastUpdated}</p>
      </PageHero>
      <div className="container-ss py-16 md:py-20">

        {/* License Sections */}
        <div className="max-w-4xl mx-auto space-y-6">
          {licenseGroups.map((group, index) => (
            <details
              key={index}
              className="bg-night-800 border border-line rounded-xl shadow-sm p-6 cursor-pointer"
            >
              <summary className="font-semibold text-star text-lg mb-2">
                {group.title}
              </summary>
              <pre className="whitespace-pre-wrap text-sm text-mist mt-4 leading-relaxed">
                {group.content}
              </pre>
            </details>
          ))}
        </div>

        {/* Footer Note */}
        <div className="max-w-3xl mx-auto text-center mt-16">
          <p className="text-mist">
            This page will be updated automatically as new dependencies are added to Starstreak.
            For questions about licensing, please contact:
          </p>
          <p className="text-brand font-medium mt-2">
            legal@starstreak.org
          </p>
        </div>

      </div>
    </div>
  );
}
