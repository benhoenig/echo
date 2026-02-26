import 'dotenv/config'
import { PrismaClient, PlanTier, UserRole, PipelineType, ReminderType, PlaybookActionType, PropertyType, ListingType, ListingGrade, ListingStatus, ContactSource, ContactStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding ECHO database...')

    // 1. Workspaces
    const bkkRealty = await prisma.workspace.upsert({
        where: { id: '11111111-1111-4111-8111-111111111111' },
        update: {},
        create: {
            id: '11111111-1111-4111-8111-111111111111',
            name: 'BKK Realty',
            planTier: PlanTier.AGENCY,
            industry: 'Real Estate',
        },
    })

    const siamProperties = await prisma.workspace.upsert({
        where: { id: '11111111-1111-4111-8111-222222222222' },
        update: {},
        create: {
            id: '11111111-1111-4111-8111-222222222222',
            name: 'Siam Properties',
            planTier: PlanTier.TEAM,
            industry: 'Real Estate',
        },
    })

    // 2. Users (Auth)
    const users = [
        { id: '22222222-2222-4222-8222-111111111111', workspaceId: bkkRealty.id, firstName: 'Somchai', lastName: 'Owner', email: 'somchai@bkkrealty.com', role: UserRole.OWNER },
        { id: '22222222-2222-4222-8222-222222222222', workspaceId: bkkRealty.id, firstName: 'Malee', lastName: 'Admin', email: 'malee@bkkrealty.com', role: UserRole.ADMIN },
        { id: '22222222-2222-4222-8222-333333333333', workspaceId: bkkRealty.id, firstName: 'Nadech', lastName: 'Agent', email: 'nadech@bkkrealty.com', role: UserRole.CO_WORKER },
        { id: '22222222-2222-4222-8222-444444444444', workspaceId: bkkRealty.id, firstName: 'Yaya', lastName: 'Agent2', email: 'yaya@bkkrealty.com', role: UserRole.CO_WORKER },
        { id: '22222222-2222-4222-8222-555555555555', workspaceId: bkkRealty.id, firstName: 'Support', lastName: 'Staff', email: 'support@bkkrealty.com', role: UserRole.LISTING_SUPPORT },
    ]

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email }, // Using email since it has @unique
            update: {},
            create: user,
        })
    }

    // 3. Zones
    const zones = [
        { id: '33333333-3333-4333-8333-111111111111', nameEnglish: 'Sukhumvit', nameThai: 'สุขุมวิท' },
        { id: '33333333-3333-4333-8333-222222222222', nameEnglish: 'Silom-Sathorn', nameThai: 'สีลม-สาทร' },
        { id: '33333333-3333-4333-8333-333333333333', nameEnglish: 'Ratchadaphisek', nameThai: 'รัชดาภิเษก' },
        { id: '33333333-3333-4333-8333-444444444444', nameEnglish: 'Ari-Phahonyothin', nameThai: 'อารีย์-พหลโยธิน' },
        { id: '33333333-3333-4333-8333-555555555555', nameEnglish: 'Thonglor-Ekkamai', nameThai: 'ทองหล่อ-เอกมัย' },
        { id: '33333333-3333-4333-8333-666666666666', nameEnglish: 'Rama 9', nameThai: 'พระราม 9' },
        { id: '33333333-3333-4333-8333-777777777777', nameEnglish: 'Bangna', nameThai: 'บางนา' },
        { id: '33333333-3333-4333-8333-888888888888', nameEnglish: 'Ladprao', nameThai: 'ลาดพร้าว' },
        { id: '33333333-3333-4333-8333-999999999999', nameEnglish: 'On Nut', nameThai: 'อ่อนนุช' },
        { id: '33333333-3333-4333-8333-aaaaaaaaaaaa', nameEnglish: 'Phra Khanong', nameThai: 'พระโขนง' },
        { id: '33333333-3333-4333-8333-bbbbbbbbbbbb', nameEnglish: 'Asoke', nameThai: 'อโศก' },
        { id: '33333333-3333-4333-8333-cccccccccccc', nameEnglish: 'Chidlom', nameThai: 'ชิดลม' },
        { id: '33333333-3333-4333-8333-dddddddddddd', nameEnglish: 'Riverside', nameThai: 'ริมแม่น้ำ' },
        { id: '33333333-3333-4333-8333-eeeeeeeeeeee', nameEnglish: 'Phaya Thai', nameThai: 'พญาไท' },
        { id: '33333333-3333-4333-8333-ffffffffffff', nameEnglish: 'Bang Sue', nameThai: 'บางซื่อ' }
    ]

    for (const zone of zones) {
        await prisma.zone.upsert({
            where: { id: zone.id },
            update: {},
            create: zone,
        })
    }

    // 4. Buyer Pipeline Stages
    const buyerStages = [
        { id: '44444444-4444-4444-8444-111111111111', workspaceId: bkkRealty.id, name: 'Inquiry', displayOrder: 1, type: PipelineType.BUYER, color: '#3b82f6', createdById: users[0].id, updatedById: users[0].id },
        { id: '44444444-4444-4444-8444-222222222222', workspaceId: bkkRealty.id, name: 'Requirement', displayOrder: 2, type: PipelineType.BUYER, color: '#8b5cf6', createdById: users[0].id, updatedById: users[0].id },
        { id: '44444444-4444-4444-8444-333333333333', workspaceId: bkkRealty.id, name: 'Unit Sent', displayOrder: 3, type: PipelineType.BUYER, color: '#ec4899', createdById: users[0].id, updatedById: users[0].id },
        { id: '44444444-4444-4444-8444-444444444444', workspaceId: bkkRealty.id, name: 'Showing', displayOrder: 4, type: PipelineType.BUYER, color: '#f59e0b', createdById: users[0].id, updatedById: users[0].id },
        { id: '44444444-4444-4444-8444-555555555555', workspaceId: bkkRealty.id, name: 'Negotiation', displayOrder: 5, type: PipelineType.BUYER, color: '#84cc16', createdById: users[0].id, updatedById: users[0].id },
        { id: '44444444-4444-4444-8444-666666666666', workspaceId: bkkRealty.id, name: 'Closed', displayOrder: 6, type: PipelineType.BUYER, color: '#10b981', createdById: users[0].id, updatedById: users[0].id }
    ]

    // 5. Seller Pipeline Stages
    const sellerStages = [
        { id: '55555555-5555-4555-8555-111111111111', workspaceId: bkkRealty.id, name: 'Listing Received', displayOrder: 1, type: PipelineType.SELLER, color: '#3b82f6', createdById: users[0].id, updatedById: users[0].id },
        { id: '55555555-5555-4555-8555-222222222222', workspaceId: bkkRealty.id, name: 'Pricing', displayOrder: 2, type: PipelineType.SELLER, color: '#8b5cf6', createdById: users[0].id, updatedById: users[0].id },
        { id: '55555555-5555-4555-8555-333333333333', workspaceId: bkkRealty.id, name: 'Active', displayOrder: 3, type: PipelineType.SELLER, color: '#10b981', createdById: users[0].id, updatedById: users[0].id },
        { id: '55555555-5555-4555-8555-444444444444', workspaceId: bkkRealty.id, name: 'Offer Received', displayOrder: 4, type: PipelineType.SELLER, color: '#f59e0b', createdById: users[0].id, updatedById: users[0].id },
        { id: '55555555-5555-4555-8555-555555555555', workspaceId: bkkRealty.id, name: 'Closed', displayOrder: 5, type: PipelineType.SELLER, color: '#84cc16', createdById: users[0].id, updatedById: users[0].id }
    ]

    for (const stage of [...buyerStages, ...sellerStages]) {
        await prisma.pipelineStage.upsert({
            where: { id: stage.id },
            update: {},
            create: {
                id: stage.id,
                workspaceId: stage.workspaceId,
                pipelineStageName: stage.name,
                stageOrder: stage.displayOrder,
                pipelineType: stage.type,
                stageColor: stage.color,
                createdById: stage.createdById,
            }
        })
    }

    // 6. Potential Configs
    const potentials = [
        { id: '66666666-6666-4666-8666-111111111111', workspaceId: bkkRealty.id, tier: 'A', displayName: 'Hot', color: '#ef4444', reminderIntervalDays: 3, reminderType: ReminderType.NOTIFICATION_ONLY },
        { id: '66666666-6666-4666-8666-222222222222', workspaceId: bkkRealty.id, tier: 'B', displayName: 'Warm', color: '#f97316', reminderIntervalDays: 7, reminderType: ReminderType.NOTIFICATION_ONLY },
        { id: '66666666-6666-4666-8666-333333333333', workspaceId: bkkRealty.id, tier: 'C', displayName: 'Cold', color: '#3b82f6', reminderIntervalDays: 30, reminderType: ReminderType.NOTIFICATION_ONLY },
        { id: '66666666-6666-4666-8666-444444444444', workspaceId: bkkRealty.id, tier: 'D', displayName: 'Inactive', color: '#9ca3af', reminderIntervalDays: 90, reminderType: ReminderType.NOTIFICATION_ONLY }
    ]

    let potentialOrder = 1;
    for (const config of potentials) {
        await prisma.potentialConfig.upsert({
            where: { id: config.id },
            update: {},
            create: {
                id: config.id,
                workspaceId: config.workspaceId,
                module: 'CRM',
                potentialLabel: config.tier,
                potentialName: config.displayName,
                color: config.color,
                reminderInterval: config.reminderIntervalDays,
                reminderType: config.reminderType,
                order: potentialOrder++,
            }
        })
    }

    // 7. Stage Action Playbooks
    const playbooks = [
        { id: '77777777-7777-4777-8777-111111111111', workspaceId: bkkRealty.id, pipelineStageId: buyerStages[0].id, actionType: PlaybookActionType.LINE_MESSAGE, label: 'Welcome Message', description: 'Send initial introduction and ask for preferences.', messageTemplate: 'Hi! I am Somchai from BKK Realty. I noticed your interest. Could you share more about what you are looking for?', reminderOverrideDays: 1, isRequired: true, createdById: users[0].id, updatedById: users[0].id },
        { id: '77777777-7777-4777-8777-222222222222', workspaceId: bkkRealty.id, pipelineStageId: buyerStages[2].id, actionType: PlaybookActionType.CUSTOM, label: 'Follow up on sent units', description: 'Ask if they liked the units you sent.', messageTemplate: 'Hi, just checking if you had a chance to look at the properties I sent over?', reminderOverrideDays: 3, isRequired: false, createdById: users[0].id, updatedById: users[0].id },
        { id: '77777777-7777-4777-8777-333333333333', workspaceId: bkkRealty.id, pipelineStageId: sellerStages[0].id, actionType: PlaybookActionType.SEND_CONTRACT, label: 'Send Owner Agreement', description: 'Send the exclusive agreement or listing agreement to the owner.', messageTemplate: 'Please find attached the listing agreement.', reminderOverrideDays: 1, isRequired: true, createdById: users[0].id, updatedById: users[0].id },
        { id: '77777777-7777-4777-8777-444444444444', workspaceId: bkkRealty.id, pipelineStageId: sellerStages[2].id, actionType: PlaybookActionType.SEND_REPORT, label: 'Monthly Status Update', description: 'Inform owner of traffic and inquiries for their listing.', messageTemplate: 'Here is the monthly activity report for your property.', reminderOverrideDays: 30, isRequired: false, createdById: users[0].id, updatedById: users[0].id }
    ]

    let playbookOrder = 1;
    for (const pb of playbooks) {
        // Determine pipeline type based on the array
        const isBuyerStage = pb.pipelineStageId === buyerStages[0].id || pb.pipelineStageId === buyerStages[2].id;

        await prisma.stageActionPlaybook.upsert({
            where: { id: pb.id },
            update: {},
            create: {
                id: pb.id,
                workspaceId: pb.workspaceId,
                pipelineType: isBuyerStage ? 'BUYER' : 'SELLER',
                pipelineStageId: pb.pipelineStageId,
                actionType: pb.actionType,
                actionLabel: pb.label,
                actionDescription: pb.description,
                actionTemplate: pb.messageTemplate,
                reminderOverride: pb.reminderOverrideDays > 0,
                overrideIntervalDays: pb.reminderOverrideDays,
                order: playbookOrder++,
                isRequired: pb.isRequired,
                createdById: pb.createdById,
            }
        })
    }

    // 8. Contacts (Seller contacts for listings)
    const contacts = [
        { id: '88888888-8888-4888-8888-111111111111', workspaceId: bkkRealty.id, contactType: ['SELLER'], firstName: 'Prawit', lastName: 'Chanthong', nickname: 'เอ', phonePrimary: '081-234-5678', lineId: 'prawit.c', contactSource: ContactSource.WALK_IN, contactStatus: ContactStatus.ACTIVE, assignedToId: users[0].id, createdById: users[0].id },
        { id: '88888888-8888-4888-8888-222222222222', workspaceId: bkkRealty.id, contactType: ['SELLER'], firstName: 'Kannika', lastName: 'Srisawat', nickname: 'แก้ว', phonePrimary: '089-876-5432', email: 'kannika.s@gmail.com', lineId: 'kannika_s', contactSource: ContactSource.REFERRAL, contactStatus: ContactStatus.ACTIVE, assignedToId: users[1].id, createdById: users[0].id },
        { id: '88888888-8888-4888-8888-333333333333', workspaceId: bkkRealty.id, contactType: ['SELLER', 'BUYER'], firstName: 'Tanawat', lastName: 'Phumiphat', nickname: 'ต้น', phonePrimary: '062-111-2233', contactSource: ContactSource.LINE, contactStatus: ContactStatus.ACTIVE, assignedToId: users[2].id, createdById: users[0].id },
        { id: '88888888-8888-4888-8888-444444444444', workspaceId: bkkRealty.id, contactType: ['SELLER'], firstName: 'Siriporn', lastName: 'Meesuk', nickname: 'ปุ๋ย', phonePrimary: '095-444-5566', email: 'siriporn.m@hotmail.com', contactSource: ContactSource.FACEBOOK, contactStatus: ContactStatus.ACTIVE, assignedToId: users[2].id, createdById: users[1].id },
        { id: '88888888-8888-4888-8888-555555555555', workspaceId: bkkRealty.id, contactType: ['SELLER'], firstName: 'David', lastName: 'Chen', phonePrimary: '091-777-8899', email: 'david.chen@outlook.com', nationality: 'Taiwanese', contactSource: ContactSource.WEBSITE, contactStatus: ContactStatus.ACTIVE, assignedToId: users[0].id, createdById: users[0].id },
    ]

    for (const contact of contacts) {
        await prisma.contact.upsert({
            where: { id: contact.id },
            update: {},
            create: {
                id: contact.id,
                workspaceId: contact.workspaceId,
                contactType: contact.contactType,
                firstName: contact.firstName,
                lastName: contact.lastName,
                nickname: contact.nickname ?? null,
                phonePrimary: contact.phonePrimary,
                email: contact.email ?? null,
                lineId: contact.lineId ?? null,
                nationality: contact.nationality ?? null,
                contactSource: contact.contactSource,
                contactStatus: contact.contactStatus,
                assignedToId: contact.assignedToId,
                createdById: contact.createdById,
            },
        })
    }

    // 9. Projects (Bangkok condominiums)
    const projects = [
        {
            id: '99999999-9999-4999-8999-111111111111',
            workspaceId: bkkRealty.id,
            nameThai: 'ไอดีโอ คิว สยาม',
            nameEnglish: 'Ideo Q Siam',
            propertyType: PropertyType.CONDO,
            zoneId: zones[0].id, // Sukhumvit
            bts: 'Siam',
            developer: 'Ananda Development',
            yearBuilt: 2019,
            numberOfBuildings: 1,
            numberOfFloors: 35,
            numberOfUnits: 413,
            parkingSlotRatio: '40%',
            facilities: ['Pool', 'Gym', 'Sauna', 'Garden', 'Co-working Space'],
            maintenanceFee: 65,
            juristicCompany: 'Plus Property',
            avgSalePriceSqm: 180000,
            avgRentalPriceSqm: 700,
            unitTypes: ['Studio', '1BR', '2BR'],
            floorToCeilingHeight: 2.55,
            maxUnitsPerFloor: 14,
            projectSegment: 'Mid-to-High',
            bestView: 'City View (North)',
            bestDirection: 'North',
            nearestStationType: 'BTS',
            nearestStationDistance: '150m',
            nearestStationTransport: 'Walk',
            targetCustomerGroup: 'Young professionals, investors',
            strengths: 'Prime location next to BTS Siam, strong rental demand, reputable developer',
            weaknesses: 'Small unit sizes, high density per floor',
            googleMapsLink: 'https://maps.app.goo.gl/ideo-q-siam',
            createdById: users[0].id,
        },
        {
            id: '99999999-9999-4999-8999-222222222222',
            workspaceId: bkkRealty.id,
            nameThai: 'แอชตัน อโศก',
            nameEnglish: 'Ashton Asoke',
            propertyType: PropertyType.CONDO,
            zoneId: zones[10].id, // Asoke
            bts: 'Asoke',
            mrt: 'Sukhumvit',
            developer: 'Ananda Development',
            yearBuilt: 2018,
            numberOfBuildings: 1,
            numberOfFloors: 50,
            numberOfUnits: 783,
            parkingSlotRatio: '50%',
            facilities: ['Pool', 'Gym', 'Sky Lounge', 'Library', 'Kids Room', 'BBQ Area'],
            maintenanceFee: 75,
            juristicCompany: 'Plus Property',
            avgSalePriceSqm: 220000,
            avgRentalPriceSqm: 800,
            unitTypes: ['1BR', '2BR', '3BR'],
            floorToCeilingHeight: 2.7,
            maxUnitsPerFloor: 18,
            projectSegment: 'High-end',
            bestView: 'Benjakitti Park View',
            bestDirection: 'South',
            nearestStationType: 'MRT',
            nearestStationDistance: '100m',
            nearestStationTransport: 'Walk',
            targetCustomerGroup: 'Expats, high-income professionals',
            strengths: 'Dual BTS/MRT access, park view units, luxury finishes',
            weaknesses: 'Legal issues with EIA, high maintenance fees',
            googleMapsLink: 'https://maps.app.goo.gl/ashton-asoke',
            createdById: users[0].id,
        },
        {
            id: '99999999-9999-4999-8999-333333333333',
            workspaceId: bkkRealty.id,
            nameThai: 'โนเบิล รีโว สีลม',
            nameEnglish: 'Noble Revo Silom',
            propertyType: PropertyType.CONDO,
            zoneId: zones[1].id, // Silom-Sathorn
            bts: 'Surasak',
            developer: 'Noble Development',
            yearBuilt: 2017,
            numberOfBuildings: 1,
            numberOfFloors: 28,
            numberOfUnits: 356,
            parkingSlotRatio: '35%',
            facilities: ['Pool', 'Gym', 'Yoga Room', 'Rooftop Garden'],
            maintenanceFee: 60,
            avgSalePriceSqm: 140000,
            avgRentalPriceSqm: 550,
            unitTypes: ['Studio', '1BR', '2BR'],
            floorToCeilingHeight: 2.5,
            projectSegment: 'Mid',
            bestView: 'River View (West)',
            nearestStationType: 'BTS',
            nearestStationDistance: '200m',
            nearestStationTransport: 'Walk',
            targetCustomerGroup: 'Young professionals, first-time buyers',
            strengths: 'Affordable in Silom area, good rental yield',
            weaknesses: 'Smaller common area, limited parking',
            googleMapsLink: 'https://maps.app.goo.gl/noble-revo-silom',
            createdById: users[1].id,
        },
        {
            id: '99999999-9999-4999-8999-444444444444',
            workspaceId: bkkRealty.id,
            nameThai: 'เดอะ ไลน์ พหลฯ-ประดิพัทธ์',
            nameEnglish: 'The Line Phahon-Pradipat',
            propertyType: PropertyType.CONDO,
            zoneId: zones[3].id, // Ari-Phahonyothin
            bts: 'Saphan Khwai',
            developer: 'Sansiri',
            yearBuilt: 2020,
            numberOfBuildings: 2,
            numberOfFloors: 40,
            numberOfUnits: 1168,
            parkingSlotRatio: '30%',
            facilities: ['Pool', 'Gym', 'Co-working Space', 'Garden', 'Shuttle to BTS'],
            maintenanceFee: 55,
            juristicCompany: 'Plus Property',
            avgSalePriceSqm: 160000,
            avgRentalPriceSqm: 600,
            unitTypes: ['Studio', '1BR', '2BR'],
            floorToCeilingHeight: 2.5,
            maxUnitsPerFloor: 20,
            projectSegment: 'Mid',
            bestView: 'Chatuchak Park View',
            bestDirection: 'East',
            nearestStationType: 'BTS',
            nearestStationDistance: '350m',
            nearestStationTransport: 'Shuttle',
            targetCustomerGroup: 'Young professionals, startup workers',
            strengths: 'Near Ari/Saphan Khwai lifestyle area, park view available',
            weaknesses: 'High density, distance to BTS requires shuttle',
            googleMapsLink: 'https://maps.app.goo.gl/the-line-phahon',
            createdById: users[1].id,
        },
    ]

    for (const project of projects) {
        await prisma.project.upsert({
            where: { id: project.id },
            update: {},
            create: {
                id: project.id,
                workspaceId: project.workspaceId,
                nameThai: project.nameThai,
                nameEnglish: project.nameEnglish,
                propertyType: project.propertyType,
                zoneId: project.zoneId,
                bts: project.bts ?? null,
                mrt: project.mrt ?? null,
                developer: project.developer ?? null,
                yearBuilt: project.yearBuilt ?? null,
                numberOfBuildings: project.numberOfBuildings ?? null,
                numberOfFloors: project.numberOfFloors ?? null,
                numberOfUnits: project.numberOfUnits ?? null,
                parkingSlotRatio: project.parkingSlotRatio ?? null,
                facilities: project.facilities ?? [],
                maintenanceFee: project.maintenanceFee ?? null,
                juristicCompany: project.juristicCompany ?? null,
                avgSalePriceSqm: project.avgSalePriceSqm ?? null,
                avgRentalPriceSqm: project.avgRentalPriceSqm ?? null,
                unitTypes: project.unitTypes ?? [],
                floorToCeilingHeight: project.floorToCeilingHeight ?? null,
                maxUnitsPerFloor: project.maxUnitsPerFloor ?? null,
                projectSegment: project.projectSegment ?? null,
                bestView: project.bestView ?? null,
                bestDirection: project.bestDirection ?? null,
                nearestStationType: project.nearestStationType ?? null,
                nearestStationDistance: project.nearestStationDistance ?? null,
                nearestStationTransport: project.nearestStationTransport ?? null,
                targetCustomerGroup: project.targetCustomerGroup ?? null,
                strengths: project.strengths ?? null,
                weaknesses: project.weaknesses ?? null,
                googleMapsLink: project.googleMapsLink ?? null,
                createdById: project.createdById,
            },
        })
    }

    // 10. Listings (12 varied listings)
    const listings = [
        // Ideo Q Siam listings
        { id: 'aaaaaaaa-aaaa-4aaa-8aaa-111111111111', workspaceId: bkkRealty.id, listingName: 'Ideo Q Siam - 1BR High Floor', projectId: projects[0].id, projectName: 'Ideo Q Siam', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.SELL, listingGrade: ListingGrade.A, listingStatus: ListingStatus.ACTIVE, sellerContactId: contacts[0].id, sellerPhone: '081-234-5678', zone: 'Sukhumvit', bts: 'Siam', unitNo: '2808', bedrooms: 1, bathrooms: 1, sizeSqm: 34, floor: 28, building: 'A', view: 'City View', direction: 'North', parkingSlots: 1, unitCondition: 'Fully Furnished', askingPrice: 5200000, commissionRate: 3, featuredFlag: true, websiteVisible: true, createdById: users[0].id, googleMapsLink: 'https://maps.app.goo.gl/ideo-q-siam' },
        { id: 'aaaaaaaa-aaaa-4aaa-8aaa-222222222222', workspaceId: bkkRealty.id, listingName: 'Ideo Q Siam - Studio Siam View', projectId: projects[0].id, projectName: 'Ideo Q Siam', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.SELL_AND_RENT, listingGrade: ListingGrade.B, listingStatus: ListingStatus.ACTIVE, sellerContactId: contacts[1].id, sellerPhone: '089-876-5432', zone: 'Sukhumvit', bts: 'Siam', unitNo: '1205', bedrooms: 0, bathrooms: 1, sizeSqm: 28, floor: 12, building: 'A', view: 'Siam Square View', direction: 'South', parkingSlots: 0, unitCondition: 'Fully Furnished', askingPrice: 4200000, rentalPrice: 18000, commissionRate: 3, websiteVisible: true, createdById: users[2].id, googleMapsLink: 'https://maps.app.goo.gl/ideo-q-siam' },
        { id: 'aaaaaaaa-aaaa-4aaa-8aaa-333333333333', workspaceId: bkkRealty.id, listingName: 'Ideo Q Siam - 2BR Corner', projectId: projects[0].id, projectName: 'Ideo Q Siam', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.SELL, listingGrade: ListingGrade.A, listingStatus: ListingStatus.RESERVED, sellerContactId: contacts[2].id, sellerPhone: '062-111-2233', zone: 'Sukhumvit', bts: 'Siam', unitNo: '3012', bedrooms: 2, bathrooms: 2, sizeSqm: 56, floor: 30, building: 'A', view: 'City View', direction: 'North', parkingSlots: 1, unitCondition: 'Fully Furnished', askingPrice: 9800000, commissionRate: 3, focusFlag: true, websiteVisible: true, createdById: users[0].id, googleMapsLink: 'https://maps.app.goo.gl/ideo-q-siam' },

        // Ashton Asoke listings
        { id: 'aaaaaaaa-aaaa-4aaa-8aaa-444444444444', workspaceId: bkkRealty.id, listingName: 'Ashton Asoke - 2BR Park View', projectId: projects[1].id, projectName: 'Ashton Asoke', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.SELL, listingGrade: ListingGrade.A, listingStatus: ListingStatus.ACTIVE, sellerContactId: contacts[4].id, sellerPhone: '091-777-8899', zone: 'Asoke', bts: 'Asoke', mrt: 'Sukhumvit', unitNo: '4205', bedrooms: 2, bathrooms: 2, sizeSqm: 64, floor: 42, view: 'Benjakitti Park', direction: 'South', parkingSlots: 1, unitCondition: 'Fully Furnished', askingPrice: 15500000, commissionRate: 3, featuredFlag: true, websiteVisible: true, focusFlag: true, createdById: users[0].id, googleMapsLink: 'https://maps.app.goo.gl/ashton-asoke' },
        { id: 'aaaaaaaa-aaaa-4aaa-8aaa-555555555555', workspaceId: bkkRealty.id, listingName: 'Ashton Asoke - 1BR Mid Floor', projectId: projects[1].id, projectName: 'Ashton Asoke', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.RENT, listingGrade: ListingGrade.B, listingStatus: ListingStatus.ACTIVE, sellerContactId: contacts[3].id, sellerPhone: '095-444-5566', zone: 'Asoke', bts: 'Asoke', mrt: 'Sukhumvit', unitNo: '2506', bedrooms: 1, bathrooms: 1, sizeSqm: 35, floor: 25, view: 'City View', direction: 'East', parkingSlots: 1, unitCondition: 'Fully Furnished', rentalPrice: 25000, commissionRate: 5, websiteVisible: true, createdById: users[2].id, googleMapsLink: 'https://maps.app.goo.gl/ashton-asoke' },

        // Noble Revo Silom listings
        { id: 'aaaaaaaa-aaaa-4aaa-8aaa-666666666666', workspaceId: bkkRealty.id, listingName: 'Noble Revo Silom - Studio River', projectId: projects[2].id, projectName: 'Noble Revo Silom', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.SELL, listingGrade: ListingGrade.C, listingStatus: ListingStatus.ACTIVE, sellerContactId: contacts[1].id, sellerPhone: '089-876-5432', zone: 'Silom-Sathorn', bts: 'Surasak', unitNo: '808', bedrooms: 0, bathrooms: 1, sizeSqm: 26, floor: 8, view: 'River View', direction: 'West', parkingSlots: 0, unitCondition: 'Bare Shell', askingPrice: 3500000, commissionRate: 3, createdById: users[1].id, googleMapsLink: 'https://maps.app.goo.gl/noble-revo-silom' },
        { id: 'aaaaaaaa-aaaa-4aaa-8aaa-777777777777', workspaceId: bkkRealty.id, listingName: 'Noble Revo Silom - 1BR Furnished', projectId: projects[2].id, projectName: 'Noble Revo Silom', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.SELL_AND_RENT, listingGrade: ListingGrade.B, listingStatus: ListingStatus.SOLD, sellerContactId: contacts[2].id, sellerPhone: '062-111-2233', zone: 'Silom-Sathorn', bts: 'Surasak', unitNo: '1505', bedrooms: 1, bathrooms: 1, sizeSqm: 32, floor: 15, view: 'City View', direction: 'East', parkingSlots: 1, unitCondition: 'Fully Furnished', askingPrice: 4800000, rentalPrice: 16000, commissionRate: 3, createdById: users[1].id, googleMapsLink: 'https://maps.app.goo.gl/noble-revo-silom' },

        // The Line listings
        { id: 'aaaaaaaa-aaaa-4aaa-8aaa-888888888888', workspaceId: bkkRealty.id, listingName: 'The Line PP - 1BR Park View', projectId: projects[3].id, projectName: 'The Line Phahon-Pradipat', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.SELL, listingGrade: ListingGrade.B, listingStatus: ListingStatus.ACTIVE, sellerContactId: contacts[3].id, sellerPhone: '095-444-5566', zone: 'Ari-Phahonyothin', bts: 'Saphan Khwai', unitNo: '2208', bedrooms: 1, bathrooms: 1, sizeSqm: 34, floor: 22, view: 'Chatuchak Park View', direction: 'East', parkingSlots: 0, unitCondition: 'Fully Furnished', askingPrice: 5500000, commissionRate: 3, websiteVisible: true, createdById: users[2].id, googleMapsLink: 'https://maps.app.goo.gl/the-line-phahon' },
        { id: 'aaaaaaaa-aaaa-4aaa-8aaa-999999999999', workspaceId: bkkRealty.id, listingName: 'The Line PP - Studio', projectId: projects[3].id, projectName: 'The Line Phahon-Pradipat', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.RENT, listingGrade: ListingGrade.C, listingStatus: ListingStatus.ACTIVE, sellerContactId: contacts[0].id, sellerPhone: '081-234-5678', zone: 'Ari-Phahonyothin', bts: 'Saphan Khwai', unitNo: '1012', bedrooms: 0, bathrooms: 1, sizeSqm: 25, floor: 10, view: 'City View', direction: 'North', parkingSlots: 0, unitCondition: 'Fully Furnished', rentalPrice: 12000, commissionRate: 5, createdById: users[2].id, googleMapsLink: 'https://maps.app.goo.gl/the-line-phahon' },

        // Non-project listings (standalone)
        { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', workspaceId: bkkRealty.id, listingName: 'Townhouse Sukhumvit 71', inProject: false, propertyType: PropertyType.TOWNHOUSE, listingType: ListingType.SELL, listingGrade: ListingGrade.B, listingStatus: ListingStatus.ACTIVE, sellerContactId: contacts[4].id, sellerPhone: '091-777-8899', zone: 'Sukhumvit', streetSoi: 'Sukhumvit 71', bedrooms: 3, bathrooms: 3, sizeSqm: 180, stories: 3, parkingSlots: 2, unitCondition: 'Renovated', askingPrice: 12000000, commissionRate: 3, websiteVisible: true, createdById: users[0].id },
        { id: 'aaaaaaaa-aaaa-4aaa-8aaa-bbbbbbbbbbbb', workspaceId: bkkRealty.id, listingName: 'Land Plot Bangna', inProject: false, propertyType: PropertyType.LAND, listingType: ListingType.SELL, listingGrade: ListingGrade.D, listingStatus: ListingStatus.NEW, sellerContactId: contacts[0].id, sellerPhone: '081-234-5678', zone: 'Bangna', sizeRai: 1, sizeNgan: 2, sizeWa: 50, askingPrice: 35000000, commissionRate: 3, createdById: users[0].id },
    ]

    for (const listing of listings) {
        await prisma.listing.upsert({
            where: { id: listing.id },
            update: {},
            create: {
                id: listing.id,
                workspaceId: listing.workspaceId,
                listingName: listing.listingName,
                projectId: listing.projectId ?? null,
                projectName: listing.projectName ?? null,
                inProject: listing.inProject,
                propertyType: listing.propertyType,
                listingType: listing.listingType,
                listingGrade: listing.listingGrade ?? null,
                listingStatus: listing.listingStatus,
                sellerContactId: listing.sellerContactId ?? null,
                sellerPhone: listing.sellerPhone ?? null,
                zone: listing.zone ?? null,
                bts: listing.bts ?? null,
                mrt: listing.mrt ?? null,
                streetSoi: listing.streetSoi ?? null,
                unitNo: listing.unitNo ?? null,
                bedrooms: listing.bedrooms ?? null,
                bathrooms: listing.bathrooms ?? null,
                sizeSqm: listing.sizeSqm ?? null,
                sizeRai: listing.sizeRai ?? null,
                sizeNgan: listing.sizeNgan ?? null,
                sizeWa: listing.sizeWa ?? null,
                floor: listing.floor ?? null,
                stories: listing.stories ?? null,
                building: listing.building ?? null,
                view: listing.view ?? null,
                direction: listing.direction ?? null,
                parkingSlots: listing.parkingSlots ?? null,
                unitCondition: listing.unitCondition ?? null,
                askingPrice: listing.askingPrice ?? null,
                rentalPrice: listing.rentalPrice ?? null,
                commissionRate: listing.commissionRate ?? null,
                featuredFlag: listing.featuredFlag ?? false,
                focusFlag: listing.focusFlag ?? false,
                websiteVisible: listing.websiteVisible ?? false,
                googleMapsLink: listing.googleMapsLink ?? null,
                createdById: listing.createdById,
            },
        })
    }

    console.log('Seeding completed successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
