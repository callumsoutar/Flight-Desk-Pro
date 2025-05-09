import { Building2 } from "lucide-react";
import Image from 'next/image';

interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  contact_email?: string;
  address?: string;
}

interface OrganizationCardProps {
  organization: Organization;
  className?: string;
}

export function OrganizationCard({ organization, className }: OrganizationCardProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
          {organization.logo_url ? (
            <Image
              src={organization.logo_url}
              alt={organization.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full border border-slate-200 bg-white object-cover"
            />
          ) : (
            <Building2 className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{organization.name}</h3>
          {organization.contact_email && (
            <p className="text-sm text-gray-500">{organization.contact_email}</p>
          )}
        </div>
      </div>
      {organization.address && (
        <p className="text-sm text-gray-600 max-w-xs mt-4">{organization.address}</p>
      )}
    </div>
  );
} 