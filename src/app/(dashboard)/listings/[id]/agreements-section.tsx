"use client";

import { useEffect, useState } from "react";
import { getAgreements } from "../agreement-actions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AgreementForm } from "./agreement-form";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

function ProtectedFileLink({ bucket, path, index }: { bucket: string, path: string, index: number }) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchSignedUrl = async () => {
            const supabase = createClient();
            let storagePath = path;

            // If it's a full public URL, extract the relative path inside the bucket
            if (path.startsWith('http')) {
                try {
                    const urlObj = new URL(path);
                    const pathParts = urlObj.pathname.split(`/public/${bucket}/`);
                    if (pathParts.length > 1) {
                        // Decode it so supabase can encode it properly itself
                        storagePath = decodeURIComponent(pathParts[1]);
                    } else {
                        // Fallback in case the URL format is not what we expect
                        setUrl(path);
                        return;
                    }
                } catch (e) {
                    setUrl(path);
                    return;
                }
            }

            // Create a signed URL valid for 1 hour (3600 seconds)
            const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, 3600);
            if (data?.signedUrl) {
                setUrl(data.signedUrl);
            } else {
                console.error("Error creating signed URL:", error);
                // Last resort fallback
                if (path.startsWith('http')) setUrl(path);
            }
        };

        fetchSignedUrl();
    }, [bucket, path]);

    if (!url) {
        return <span className="text-xs text-muted-foreground inline-flex items-center px-2 py-1">Loading...</span>;
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
        >
            <FileText className="w-3 h-3 mr-1" /> File {index + 1}
        </a>
    );
}

interface AgreementsSectionProps {
    listingId: string;
    workspaceId: string;
    agents: { id: string; name: string }[];
    contacts: { id: string; name: string }[];
}

export function AgreementsSection({ listingId, workspaceId, agents, contacts }: AgreementsSectionProps) {
    const [agreements, setAgreements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const fetchAgreements = async () => {
        setLoading(true);
        const res = await getAgreements(listingId);
        if (res.success && res.data) {
            setAgreements(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAgreements();
    }, [listingId]);

    const handleSuccess = () => {
        setIsAddOpen(false);
        fetchAgreements();
    };

    const getBadgeVariant = (type: string) => {
        switch (type) {
            case "SPA": return "default";
            case "EXCLUSIVE_AGENT": return "destructive"; // Red/Orange for exclusive
            case "OPEN_AGENT": return "secondary";
            default: return "outline";
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "ACTIVE": return "default";
            case "RENEWED": return "secondary";
            case "EXPIRED": return "destructive";
            case "CANCELLED": return "outline";
            default: return "outline";
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        Agreements
                    </h3>
                    <p className="text-sm text-muted-foreground">Manage SPA, Open, and Exclusive agreements.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Agreement
                </Button>
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>New Agreement</DialogTitle>
                    </DialogHeader>
                    <AgreementForm
                        listingId={listingId}
                        workspaceId={workspaceId}
                        onSuccess={handleSuccess}
                        agents={agents}
                        contacts={contacts}
                    />
                </DialogContent>
            </Dialog>

            {loading ? (
                <p className="text-sm text-muted-foreground">Loading agreements...</p>
            ) : agreements.length === 0 ? (
                <div className="border border-dashed rounded-lg p-8 text-center bg-muted/20">
                    <p className="text-sm text-muted-foreground">No agreements attached to this listing yet.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {agreements.map((agreement) => (
                        <Card key={agreement.id} className="relative overflow-hidden">
                            {agreement.agreementStatus === 'ACTIVE' && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                            )}
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant={getBadgeVariant(agreement.agreementType)}>
                                        {agreement.agreementType.replace("_", " ")}
                                    </Badge>
                                    <Badge variant={getStatusBadgeVariant(agreement.agreementStatus)} className="text-[10px]">
                                        {agreement.agreementStatus}
                                    </Badge>
                                </div>
                                <CardTitle className="text-base mt-2">
                                    {agreement.agreementType === "SPA" ? "Sale & Purchase" : "Agent Contract"}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Created {format(new Date(agreement.createdAt), "dd MMM yyyy")}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="text-sm space-y-2">
                                {agreement.startDate && agreement.endDate && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Valid:</span>
                                        <span>{format(new Date(agreement.startDate), "dd/MM/yy")} - {format(new Date(agreement.endDate), "dd/MM/yy")}</span>
                                    </div>
                                )}
                                {agreement.commissionRate && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Commission:</span>
                                        <span>{agreement.commissionRate}%</span>
                                    </div>
                                )}
                                {agreement.salePrice && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Sale Price:</span>
                                        <span>${agreement.salePrice.toLocaleString()}</span>
                                    </div>
                                )}

                                <Separator className="my-2" />

                                {/* Agents / Contacts */}
                                {agreement.assignedAgent && (
                                    <p className="text-xs"><span className="text-muted-foreground">Agent:</span> {agreement.assignedAgent.firstName} {agreement.assignedAgent.lastName}</p>
                                )}
                                {agreement.sellerContact && (
                                    <p className="text-xs"><span className="text-muted-foreground">Seller:</span> {agreement.sellerContact.firstName} {agreement.sellerContact.lastName}</p>
                                )}
                                {agreement.buyerContact && (
                                    <p className="text-xs"><span className="text-muted-foreground">Buyer:</span> {agreement.buyerContact.firstName} {agreement.buyerContact.lastName}</p>
                                )}

                                {/* Attachments */}
                                {agreement.agreementFilesUrl && agreement.agreementFilesUrl.length > 0 && (
                                    <div className="pt-2 mt-2 border-t">
                                        <p className="text-xs text-muted-foreground mb-1">Attachments:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {agreement.agreementFilesUrl.map((url: string, i: number) => (
                                                <ProtectedFileLink key={i} path={url} index={i} bucket="agreements" />
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
