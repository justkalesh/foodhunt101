
import { supabase } from './supabase';
import { Vendor, MenuItem, UserRole } from '../types';

export const seedDatabase = async () => {
    try {
        // Check if data already exists to prevent duplicates
        const { data: vendorSnap, error: vendorError } = await supabase.from('vendors').select('*');
        if (vendorError) throw vendorError;

        // Ensure system user logic is a bit different in SQL. 
        // We can try to insert it, if it exists (constraint error), ignore.
        const systemUser = {
            id: 'foodhunt101lpu@gmail.com',
            email: 'foodhunt101lpu@gmail.com',
            name: 'Food Hunt Admin',
            role: 'admin', // Use string literal matching definition
            semester: 'N/A',
            is_disabled: false,
            created_at: new Date().toISOString(),
            loyalty_points: 0,
            pfp_url: 'https://cdn-icons-png.flaticon.com/512/2304/2304226.png'
        };

        const { error: userError } = await supabase.from('users').insert(systemUser);
        if (userError && userError.code !== '23505') { // 23505 is unique violation
            console.log("System user ensure error (likely exists):", userError.message);
        } else {
            console.log('System user ensured.');
        }

        if (vendorSnap && vendorSnap.length > 0) {
            return { success: false, message: 'Database already has data! (System user ensured)' };
        }

        const vendors: Omit<Vendor, 'id'>[] = [
            {
                name: 'Spicy Dragon', description: 'Authentic Sichuan flavors on campus.',
                location: 'Student Center', cuisine: 'Chinese', origin_tag: 'Chinese', rush_level: 'high',
                logo_url: 'https://cdn-icons-png.flaticon.com/512/1046/1046751.png',
                menu_image_urls: ['https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80'],
                contact_number: '1234567890',
                lowest_item_price: 5, avg_price_per_meal: 12,
                popularity_score: 95, is_active: true, created_at: new Date().toISOString(),
                rating_avg: 4.5, rating_count: 10
            },
            {
                name: 'Dosa Plaza', description: 'Crispy dosas and filter coffee.',
                location: 'Block A Canteen', cuisine: 'South Indian', origin_tag: 'South', rush_level: 'mid',
                logo_url: 'https://cdn-icons-png.flaticon.com/512/737/737967.png',
                menu_image_urls: ['https://images.unsplash.com/photo-1589301760576-47c4210aa151?w=800&q=80'],
                contact_number: '9876543210',
                lowest_item_price: 3, avg_price_per_meal: 6,
                popularity_score: 88, is_active: true, created_at: new Date().toISOString(),
                rating_avg: 4.2, rating_count: 8
            },
            {
                name: 'Burger Point', description: 'Classic burgers and fries.',
                location: 'Library Lawn', cuisine: 'Fast Food', origin_tag: 'West', rush_level: 'low',
                logo_url: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
                menu_image_urls: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80'],
                contact_number: '5555555555',
                lowest_item_price: 4, avg_price_per_meal: 9,
                popularity_score: 75, is_active: true, created_at: new Date().toISOString(),
                rating_avg: 4.0, rating_count: 5
            }
        ];

        for (const v of vendors) {
            const { data: vRef, error: vError } = await supabase.from('vendors').insert(v).select().single();
            if (vError) throw vError;
            console.log(`Added vendor: ${v.name}`);

            // Add Menu Items for this vendor
            const items: Omit<MenuItem, 'id'>[] = [];
            if (v.name === 'Spicy Dragon') {
                items.push(
                    { vendor_id: vRef.id, name: 'Kung Pao Chicken', price: 12, is_active: true },
                    { vendor_id: vRef.id, name: 'Spicy Noodles', price: 8, is_active: true },
                    { vendor_id: vRef.id, name: 'Mapo Tofu', price: 10, is_active: true }
                );
            } else if (v.name === 'Dosa Plaza') {
                items.push(
                    { vendor_id: vRef.id, name: 'Masala Dosa', price: 6, is_active: true },
                    { vendor_id: vRef.id, name: 'Idli Sambar', price: 4, is_active: true },
                    { vendor_id: vRef.id, name: 'Filter Coffee', price: 2, is_active: true }
                );
            } else {
                items.push(
                    { vendor_id: vRef.id, name: 'Cheeseburger', price: 7, is_active: true },
                    { vendor_id: vRef.id, name: 'Fries', price: 3, is_active: true },
                    { vendor_id: vRef.id, name: 'Coke', price: 2, is_active: true }
                );
            }

            const { error: itemsError } = await supabase.from('menu_items').insert(items);
            if (itemsError) throw itemsError;
        }

        return { success: true, message: 'Database seeded successfully!' };
    } catch (error: any) {
        console.error(error);
        return { success: false, message: error.message };
    }
};
