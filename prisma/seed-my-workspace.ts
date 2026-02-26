import 'dotenv/config'
import { PrismaClient, PropertyType, ListingType, ListingGrade, ListingStatus, ContactSource, ContactStatus } from '@prisma/client'

const prisma = new PrismaClient()

const WORKSPACE_ID = 'ed0e3b9f-f2ab-4101-83f8-bed1ef784d12'

async function main() {
    console.log(`Seeding data into workspace ${WORKSPACE_ID}...`)

    // Get the first user in this workspace to use as created_by
    const user = await prisma.user.findFirst({
        where: { workspaceId: WORKSPACE_ID },
    })

    if (!user) {
        console.error('No user found in workspace. Aborting.')
        process.exit(1)
    }

    console.log(`Using user: ${user.firstName} ${user.lastName} (${user.id})`)

    // Get existing zones
    const zones = await prisma.zone.findMany({
        orderBy: { nameEnglish: 'asc' },
    })

    if (zones.length === 0) {
        console.error('No zones found. Run the main seed first.')
        process.exit(1)
    }

    console.log(`Found ${zones.length} zones`)

    // Map zone names to IDs for easy lookup
    const zoneMap = Object.fromEntries(zones.map(z => [z.nameEnglish, z.id]))

    // 1. Contacts
    const contacts = [
        { id: 'c0000001-0000-4000-8000-000000000001', contactType: ['SELLER'], firstName: 'Prawit', lastName: 'Chanthong', nickname: 'เอ', phonePrimary: '081-234-5678', lineId: 'prawit.c', contactSource: ContactSource.WALK_IN, contactStatus: ContactStatus.ACTIVE },
        { id: 'c0000001-0000-4000-8000-000000000002', contactType: ['SELLER'], firstName: 'Kannika', lastName: 'Srisawat', nickname: 'แก้ว', phonePrimary: '089-876-5432', email: 'kannika.s@gmail.com', lineId: 'kannika_s', contactSource: ContactSource.REFERRAL, contactStatus: ContactStatus.ACTIVE },
        { id: 'c0000001-0000-4000-8000-000000000003', contactType: ['SELLER', 'BUYER'], firstName: 'Tanawat', lastName: 'Phumiphat', nickname: 'ต้น', phonePrimary: '062-111-2233', contactSource: ContactSource.LINE, contactStatus: ContactStatus.ACTIVE },
        { id: 'c0000001-0000-4000-8000-000000000004', contactType: ['SELLER'], firstName: 'Siriporn', lastName: 'Meesuk', nickname: 'ปุ๋ย', phonePrimary: '095-444-5566', email: 'siriporn.m@hotmail.com', contactSource: ContactSource.FACEBOOK, contactStatus: ContactStatus.ACTIVE },
        { id: 'c0000001-0000-4000-8000-000000000005', contactType: ['SELLER'], firstName: 'David', lastName: 'Chen', phonePrimary: '091-777-8899', email: 'david.chen@outlook.com', nationality: 'Taiwanese', contactSource: ContactSource.WEBSITE, contactStatus: ContactStatus.ACTIVE },
    ]

    for (const c of contacts) {
        await prisma.contact.upsert({
            where: { id: c.id },
            update: {},
            create: {
                id: c.id,
                workspaceId: WORKSPACE_ID,
                contactType: c.contactType,
                firstName: c.firstName,
                lastName: c.lastName,
                nickname: c.nickname ?? null,
                phonePrimary: c.phonePrimary,
                email: c.email ?? null,
                lineId: c.lineId ?? null,
                nationality: c.nationality ?? null,
                contactSource: c.contactSource,
                contactStatus: c.contactStatus,
                assignedToId: user.id,
                createdById: user.id,
            },
        })
    }
    console.log(`✓ ${contacts.length} contacts upserted`)

    // 2. Projects
    const projects = [
        {
            id: 'a0000001-0000-4000-8000-000000000001',
            nameThai: 'ไอดีโอ คิว สยาม',
            nameEnglish: 'Ideo Q Siam',
            propertyType: PropertyType.CONDO,
            zoneName: 'Sukhumvit',
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
        },
        {
            id: 'a0000001-0000-4000-8000-000000000002',
            nameThai: 'แอชตัน อโศก',
            nameEnglish: 'Ashton Asoke',
            propertyType: PropertyType.CONDO,
            zoneName: 'Asoke',
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
        },
        {
            id: 'a0000001-0000-4000-8000-000000000003',
            nameThai: 'โนเบิล รีโว สีลม',
            nameEnglish: 'Noble Revo Silom',
            propertyType: PropertyType.CONDO,
            zoneName: 'Silom-Sathorn',
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
        },
        {
            id: 'a0000001-0000-4000-8000-000000000004',
            nameThai: 'เดอะ ไลน์ พหลฯ-ประดิพัทธ์',
            nameEnglish: 'The Line Phahon-Pradipat',
            propertyType: PropertyType.CONDO,
            zoneName: 'Ari-Phahonyothin',
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
        },
    ]

    for (const p of projects) {
        const { zoneName, ...rest } = p
        await prisma.project.upsert({
            where: { id: p.id },
            update: {},
            create: {
                ...rest,
                workspaceId: WORKSPACE_ID,
                zoneId: zoneMap[zoneName] ?? null,
                createdById: user.id,
            },
        })
    }
    console.log(`✓ ${projects.length} projects upserted`)

    // 3. Listings
    const listings = [
        { id: 'b0000001-0000-4000-8000-000000000001', listingName: 'Ideo Q Siam - 1BR High Floor', projectId: projects[0].id, projectName: 'Ideo Q Siam', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.SELL, listingGrade: ListingGrade.A, listingStatus: ListingStatus.ACTIVE, sellerContactId: contacts[0].id, sellerPhone: '081-234-5678', zone: 'Sukhumvit', bts: 'Siam', unitNo: '2808', bedrooms: 1, bathrooms: 1, sizeSqm: 34, floor: 28, building: 'A', view: 'City View', direction: 'North', parkingSlots: 1, unitCondition: 'Fully Furnished', askingPrice: 5200000, commissionRate: 3, featuredFlag: true, websiteVisible: true },
        { id: 'b0000001-0000-4000-8000-000000000002', listingName: 'Ideo Q Siam - Studio Siam View', projectId: projects[0].id, projectName: 'Ideo Q Siam', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.SELL_AND_RENT, listingGrade: ListingGrade.B, listingStatus: ListingStatus.ACTIVE, sellerContactId: contacts[1].id, sellerPhone: '089-876-5432', zone: 'Sukhumvit', bts: 'Siam', unitNo: '1205', bedrooms: 0, bathrooms: 1, sizeSqm: 28, floor: 12, building: 'A', view: 'Siam Square View', direction: 'South', parkingSlots: 0, unitCondition: 'Fully Furnished', askingPrice: 4200000, rentalPrice: 18000, commissionRate: 3, websiteVisible: true },
        { id: 'b0000001-0000-4000-8000-000000000003', listingName: 'Ideo Q Siam - 2BR Corner', projectId: projects[0].id, projectName: 'Ideo Q Siam', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.SELL, listingGrade: ListingGrade.A, listingStatus: ListingStatus.RESERVED, sellerContactId: contacts[2].id, sellerPhone: '062-111-2233', zone: 'Sukhumvit', bts: 'Siam', unitNo: '3012', bedrooms: 2, bathrooms: 2, sizeSqm: 56, floor: 30, building: 'A', view: 'City View', direction: 'North', parkingSlots: 1, unitCondition: 'Fully Furnished', askingPrice: 9800000, commissionRate: 3, focusFlag: true, websiteVisible: true },
        { id: 'b0000001-0000-4000-8000-000000000004', listingName: 'Ashton Asoke - 2BR Park View', projectId: projects[1].id, projectName: 'Ashton Asoke', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.SELL, listingGrade: ListingGrade.A, listingStatus: ListingStatus.ACTIVE, sellerContactId: contacts[4].id, sellerPhone: '091-777-8899', zone: 'Asoke', bts: 'Asoke', mrt: 'Sukhumvit', unitNo: '4205', bedrooms: 2, bathrooms: 2, sizeSqm: 64, floor: 42, view: 'Benjakitti Park', direction: 'South', parkingSlots: 1, unitCondition: 'Fully Furnished', askingPrice: 15500000, commissionRate: 3, featuredFlag: true, websiteVisible: true, focusFlag: true },
        { id: 'b0000001-0000-4000-8000-000000000005', listingName: 'Ashton Asoke - 1BR Mid Floor', projectId: projects[1].id, projectName: 'Ashton Asoke', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.RENT, listingGrade: ListingGrade.B, listingStatus: ListingStatus.ACTIVE, sellerContactId: contacts[3].id, sellerPhone: '095-444-5566', zone: 'Asoke', bts: 'Asoke', mrt: 'Sukhumvit', unitNo: '2506', bedrooms: 1, bathrooms: 1, sizeSqm: 35, floor: 25, view: 'City View', direction: 'East', parkingSlots: 1, unitCondition: 'Fully Furnished', rentalPrice: 25000, commissionRate: 5, websiteVisible: true },
        { id: 'b0000001-0000-4000-8000-000000000006', listingName: 'Noble Revo Silom - Studio River', projectId: projects[2].id, projectName: 'Noble Revo Silom', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.SELL, listingGrade: ListingGrade.C, listingStatus: ListingStatus.ACTIVE, sellerContactId: contacts[1].id, sellerPhone: '089-876-5432', zone: 'Silom-Sathorn', bts: 'Surasak', unitNo: '808', bedrooms: 0, bathrooms: 1, sizeSqm: 26, floor: 8, view: 'River View', direction: 'West', parkingSlots: 0, unitCondition: 'Bare Shell', askingPrice: 3500000, commissionRate: 3 },
        { id: 'b0000001-0000-4000-8000-000000000007', listingName: 'Noble Revo Silom - 1BR Furnished', projectId: projects[2].id, projectName: 'Noble Revo Silom', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.SELL_AND_RENT, listingGrade: ListingGrade.B, listingStatus: ListingStatus.SOLD, sellerContactId: contacts[2].id, sellerPhone: '062-111-2233', zone: 'Silom-Sathorn', bts: 'Surasak', unitNo: '1505', bedrooms: 1, bathrooms: 1, sizeSqm: 32, floor: 15, view: 'City View', direction: 'East', parkingSlots: 1, unitCondition: 'Fully Furnished', askingPrice: 4800000, rentalPrice: 16000, commissionRate: 3 },
        { id: 'b0000001-0000-4000-8000-000000000008', listingName: 'The Line PP - 1BR Park View', projectId: projects[3].id, projectName: 'The Line Phahon-Pradipat', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.SELL, listingGrade: ListingGrade.B, listingStatus: ListingStatus.ACTIVE, sellerContactId: contacts[3].id, sellerPhone: '095-444-5566', zone: 'Ari-Phahonyothin', bts: 'Saphan Khwai', unitNo: '2208', bedrooms: 1, bathrooms: 1, sizeSqm: 34, floor: 22, view: 'Chatuchak Park View', direction: 'East', parkingSlots: 0, unitCondition: 'Fully Furnished', askingPrice: 5500000, commissionRate: 3, websiteVisible: true },
        { id: 'b0000001-0000-4000-8000-000000000009', listingName: 'The Line PP - Studio', projectId: projects[3].id, projectName: 'The Line Phahon-Pradipat', inProject: true, propertyType: PropertyType.CONDO, listingType: ListingType.RENT, listingGrade: ListingGrade.C, listingStatus: ListingStatus.ACTIVE, sellerContactId: contacts[0].id, sellerPhone: '081-234-5678', zone: 'Ari-Phahonyothin', bts: 'Saphan Khwai', unitNo: '1012', bedrooms: 0, bathrooms: 1, sizeSqm: 25, floor: 10, view: 'City View', direction: 'North', parkingSlots: 0, unitCondition: 'Fully Furnished', rentalPrice: 12000, commissionRate: 5 },
        { id: 'b0000001-0000-4000-8000-000000000010', listingName: 'Townhouse Sukhumvit 71', inProject: false, propertyType: PropertyType.TOWNHOUSE, listingType: ListingType.SELL, listingGrade: ListingGrade.B, listingStatus: ListingStatus.ACTIVE, sellerContactId: contacts[4].id, sellerPhone: '091-777-8899', zone: 'Sukhumvit', streetSoi: 'Sukhumvit 71', bedrooms: 3, bathrooms: 3, sizeSqm: 180, stories: 3, parkingSlots: 2, unitCondition: 'Renovated', askingPrice: 12000000, commissionRate: 3, websiteVisible: true },
        { id: 'b0000001-0000-4000-8000-000000000011', listingName: 'Land Plot Bangna', inProject: false, propertyType: PropertyType.LAND, listingType: ListingType.SELL, listingGrade: ListingGrade.D, listingStatus: ListingStatus.NEW, sellerContactId: contacts[0].id, sellerPhone: '081-234-5678', zone: 'Bangna', sizeRai: 1, sizeNgan: 2, sizeWa: 50, askingPrice: 35000000, commissionRate: 3 },
    ]

    for (const l of listings) {
        await prisma.listing.upsert({
            where: { id: l.id },
            update: {},
            create: {
                id: l.id,
                workspaceId: WORKSPACE_ID,
                listingName: l.listingName,
                projectId: l.projectId ?? null,
                projectName: l.projectName ?? null,
                inProject: l.inProject,
                propertyType: l.propertyType,
                listingType: l.listingType,
                listingGrade: l.listingGrade ?? null,
                listingStatus: l.listingStatus,
                sellerContactId: l.sellerContactId ?? null,
                sellerPhone: l.sellerPhone ?? null,
                zone: l.zone ?? null,
                bts: l.bts ?? null,
                mrt: l.mrt ?? null,
                streetSoi: l.streetSoi ?? null,
                unitNo: l.unitNo ?? null,
                bedrooms: l.bedrooms ?? null,
                bathrooms: l.bathrooms ?? null,
                sizeSqm: l.sizeSqm ?? null,
                sizeRai: l.sizeRai ?? null,
                sizeNgan: l.sizeNgan ?? null,
                sizeWa: l.sizeWa ?? null,
                floor: l.floor ?? null,
                stories: l.stories ?? null,
                building: l.building ?? null,
                view: l.view ?? null,
                direction: l.direction ?? null,
                parkingSlots: l.parkingSlots ?? null,
                unitCondition: l.unitCondition ?? null,
                askingPrice: l.askingPrice ?? null,
                rentalPrice: l.rentalPrice ?? null,
                commissionRate: l.commissionRate ?? null,
                featuredFlag: l.featuredFlag ?? false,
                focusFlag: l.focusFlag ?? false,
                websiteVisible: l.websiteVisible ?? false,
                createdById: user.id,
            },
        })
    }
    console.log(`✓ ${listings.length} listings upserted`)

    console.log('\n✅ Seed data for your workspace is ready!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
