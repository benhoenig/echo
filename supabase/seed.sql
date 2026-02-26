-- Seed Data for ECHO Phase 0
-- Idempotent insertions (ON CONFLICT DO NOTHING)

-- 1. Create Workspaces
INSERT INTO public.workspaces (id, name, plan_tier, industry, created_at, updated_at)
VALUES 
    ('11111111-1111-4111-8111-111111111111', 'BKK Realty', 'AGENCY', 'Real Estate', now(), now()),
    ('11111111-1111-4111-8111-222222222222', 'Siam Properties', 'TEAM', 'Real Estate', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 2. Create Users
INSERT INTO public.users (id, workspace_id, first_name, last_name, email, role, is_active, created_at, updated_at)
VALUES
    ('22222222-2222-4222-8222-111111111111', '11111111-1111-4111-8111-111111111111', 'Somchai', 'Owner', 'somchai@bkkrealty.com', 'OWNER', true, now(), now()),
    ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'Malee', 'Admin', 'malee@bkkrealty.com', 'ADMIN', true, now(), now()),
    ('22222222-2222-4222-8222-333333333333', '11111111-1111-4111-8111-111111111111', 'Nadech', 'Agent', 'nadech@bkkrealty.com', 'CO_WORKER', true, now(), now()),
    ('22222222-2222-4222-8222-444444444444', '11111111-1111-4111-8111-111111111111', 'Yaya', 'Agent2', 'yaya@bkkrealty.com', 'CO_WORKER', true, now(), now()),
    ('22222222-2222-4222-8222-555555555555', '11111111-1111-4111-8111-111111111111', 'Support', 'Staff', 'support@bkkrealty.com', 'LISTING_SUPPORT', true, now(), now())
ON CONFLICT (email) DO NOTHING;

-- 3. Create Zones
INSERT INTO public.zones (id, zone_name_english, zone_name_thai)
VALUES
    ('33333333-3333-4333-8333-111111111111', 'Sukhumvit', 'สุขุมวิท'),
    ('33333333-3333-4333-8333-222222222222', 'Silom-Sathorn', 'สีลม-สาทร'),
    ('33333333-3333-4333-8333-333333333333', 'Ratchadaphisek', 'รัชดาภิเษก'),
    ('33333333-3333-4333-8333-444444444444', 'Ari-Phahonyothin', 'อารีย์-พหลโยธิน'),
    ('33333333-3333-4333-8333-555555555555', 'Thonglor-Ekkamai', 'ทองหล่อ-เอกมัย'),
    ('33333333-3333-4333-8333-666666666666', 'Rama 9', 'พระราม 9'),
    ('33333333-3333-4333-8333-777777777777', 'Bangna', 'บางนา'),
    ('33333333-3333-4333-8333-888888888888', 'Ladprao', 'ลาดพร้าว'),
    ('33333333-3333-4333-8333-999999999999', 'On Nut', 'อ่อนนุช'),
    ('33333333-3333-4333-8333-aaaaaaaaaaaa', 'Phra Khanong', 'พระโขนง'),
    ('33333333-3333-4333-8333-bbbbbbbbbbbb', 'Asoke', 'อโศก'),
    ('33333333-3333-4333-8333-cccccccccccc', 'Chidlom', 'ชิดลม'),
    ('33333333-3333-4333-8333-dddddddddddd', 'Riverside', 'ริมแม่น้ำ'),
    ('33333333-3333-4333-8333-eeeeeeeeeeee', 'Phaya Thai', 'พญาไท'),
    ('33333333-3333-4333-8333-ffffffffffff', 'Bang Sue', 'บางซื่อ')
ON CONFLICT (id) DO NOTHING;

-- 4. Buyer Pipeline Stages
INSERT INTO public.pipeline_stages (id, workspace_id, name, display_order, type, color, is_active, created_by_id, updated_by_id, created_at, updated_at)
VALUES
    ('44444444-4444-4444-8444-111111111111', '11111111-1111-4111-8111-111111111111', 'Inquiry', 1, 'BUYER', '#3b82f6', true, '22222222-2222-4222-8222-111111111111', '22222222-2222-4222-8222-111111111111', now(), now()),
    ('44444444-4444-4444-8444-222222222222', '11111111-1111-4111-8111-111111111111', 'Requirement', 2, 'BUYER', '#8b5cf6', true, '22222222-2222-4222-8222-111111111111', '22222222-2222-4222-8222-111111111111', now(), now()),
    ('44444444-4444-4444-8444-333333333333', '11111111-1111-4111-8111-111111111111', 'Unit Sent', 3, 'BUYER', '#ec4899', true, '22222222-2222-4222-8222-111111111111', '22222222-2222-4222-8222-111111111111', now(), now()),
    ('44444444-4444-4444-8444-444444444444', '11111111-1111-4111-8111-111111111111', 'Showing', 4, 'BUYER', '#f59e0b', true, '22222222-2222-4222-8222-111111111111', '22222222-2222-4222-8222-111111111111', now(), now()),
    ('44444444-4444-4444-8444-555555555555', '11111111-1111-4111-8111-111111111111', 'Negotiation', 5, 'BUYER', '#84cc16', true, '22222222-2222-4222-8222-111111111111', '22222222-2222-4222-8222-111111111111', now(), now()),
    ('44444444-4444-4444-8444-666666666666', '11111111-1111-4111-8111-111111111111', 'Closed', 6, 'BUYER', '#10b981', true, '22222222-2222-4222-8222-111111111111', '22222222-2222-4222-8222-111111111111', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 5. Seller Pipeline Stages
INSERT INTO public.pipeline_stages (id, workspace_id, name, display_order, type, color, is_active, created_by_id, updated_by_id, created_at, updated_at)
VALUES
    ('55555555-5555-4555-8555-111111111111', '11111111-1111-4111-8111-111111111111', 'Listing Received', 1, 'SELLER', '#3b82f6', true, '22222222-2222-4222-8222-111111111111', '22222222-2222-4222-8222-111111111111', now(), now()),
    ('55555555-5555-4555-8555-222222222222', '11111111-1111-4111-8111-111111111111', 'Pricing', 2, 'SELLER', '#8b5cf6', true, '22222222-2222-4222-8222-111111111111', '22222222-2222-4222-8222-111111111111', now(), now()),
    ('55555555-5555-4555-8555-333333333333', '11111111-1111-4111-8111-111111111111', 'Active', 3, 'SELLER', '#10b981', true, '22222222-2222-4222-8222-111111111111', '22222222-2222-4222-8222-111111111111', now(), now()),
    ('55555555-5555-4555-8555-444444444444', '11111111-1111-4111-8111-111111111111', 'Offer Received', 4, 'SELLER', '#f59e0b', true, '22222222-2222-4222-8222-111111111111', '22222222-2222-4222-8222-111111111111', now(), now()),
    ('55555555-5555-4555-8555-555555555555', '11111111-1111-4111-8111-111111111111', 'Closed', 5, 'SELLER', '#84cc16', true, '22222222-2222-4222-8222-111111111111', '22222222-2222-4222-8222-111111111111', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 6. Potential Configs
INSERT INTO public.potential_configs (id, workspace_id, tier, display_name, color, reminder_interval_days, reminder_type, is_active, created_at, updated_at)
VALUES
    ('66666666-6666-4666-8666-111111111111', '11111111-1111-4111-8111-111111111111', 'A', 'Hot', '#ef4444', 3, 'IN_APP', true, now(), now()),
    ('66666666-6666-4666-8666-222222222222', '11111111-1111-4111-8111-111111111111', 'B', 'Warm', '#f97316', 7, 'IN_APP', true, now(), now()),
    ('66666666-6666-4666-8666-333333333333', '11111111-1111-4111-8111-111111111111', 'C', 'Cold', '#3b82f6', 30, 'IN_APP', true, now(), now()),
    ('66666666-6666-4666-8666-444444444444', '11111111-1111-4111-8111-111111111111', 'D', 'Inactive', '#9ca3af', 90, 'IN_APP', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 7. Stage Action Playbooks
INSERT INTO public.stage_action_playbooks (id, workspace_id, pipeline_stage_id, action_type, label, description, message_template, reminder_override_days, is_required, created_by_id, updated_by_id, created_at, updated_at)
VALUES
    ('77777777-7777-4777-8777-111111111111', '11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-111111111111', 'MESSAGE_CLIENT', 'Welcome Message', 'Send initial introduction and ask for preferences.', 'Hi! I am Somchai from BKK Realty. I noticed your interest. Could you share more about what you are looking for?', 1, true, '22222222-2222-4222-8222-111111111111', '22222222-2222-4222-8222-111111111111', now(), now()),
    ('77777777-7777-4777-8777-222222222222', '11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-333333333333', 'FOLLOW_UP', 'Follow up on sent units', 'Ask if they liked the units you sent.', 'Hi, just checking if you had a chance to look at the properties I sent over?', 3, false, '22222222-2222-4222-8222-111111111111', '22222222-2222-4222-8222-111111111111', now(), now()),
    ('77777777-7777-4777-8777-333333333333', '11111111-1111-4111-8111-111111111111', '55555555-5555-4555-8555-111111111111', 'SEND_DOCUMENTS', 'Send Owner Agreement', 'Send the exclusive agreement or listing agreement to the owner.', 'Please find attached the listing agreement.', 1, true, '22222222-2222-4222-8222-111111111111', '22222222-2222-4222-8222-111111111111', now(), now()),
    ('77777777-7777-4777-8777-444444444444', '11111111-1111-4111-8111-111111111111', '55555555-5555-4555-8555-333333333333', 'FOLLOW_UP', 'Monthly Status Update', 'Inform owner of traffic and inquiries for their listing.', 'Here is the monthly activity report for your property.', 30, false, '22222222-2222-4222-8222-111111111111', '22222222-2222-4222-8222-111111111111', now(), now())
ON CONFLICT (id) DO NOTHING;
