'use client';

import { useState } from 'react';
import AdminBottomBar from './AdminBottomBar';
import AdminMobileMenu from './AdminMobileMenu';

export default function AdminMobileWrapper() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <AdminMobileMenu isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
            <AdminBottomBar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        </>
    );
}
