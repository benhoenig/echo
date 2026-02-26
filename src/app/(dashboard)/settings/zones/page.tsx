import { getZones } from "./zone-actions";
import { ZoneContent } from "./zone-content";

export default async function ZonesPage() {
    const zones = await getZones();

    return <ZoneContent initialZones={zones} />;
}
