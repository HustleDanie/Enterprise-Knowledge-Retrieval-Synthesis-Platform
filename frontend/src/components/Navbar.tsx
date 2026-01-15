'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap } from 'lucide-react';
import clsx from 'clsx';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/architecture', label: 'Architecture' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 glass-effect border-b border-brand-100/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-brand-500/25 transition-shadow">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Knowledge Platform</h1>
              <p className="text-xs text-gray-600">Enterprise Retrieval</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-brand-600'
                    : 'text-gray-600 hover:text-brand-600'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
