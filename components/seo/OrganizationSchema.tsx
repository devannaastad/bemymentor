export default function OrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.bemymentor.co';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BeMyMentor',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Mentorship for the next generation. Learn from top Ecommerce and Marketing experts, Trading pros, Streamers, YouTube creators, and Gaming & Esports professionals.',
    sameAs: [
      // Add your social media URLs here when you have them
      // 'https://twitter.com/bemymentor',
      // 'https://facebook.com/bemymentor',
      // 'https://instagram.com/bemymentor',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      url: `${baseUrl}/contact`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
