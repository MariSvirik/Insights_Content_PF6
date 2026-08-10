import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ActionGroup,
    Alert,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Checkbox,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownList,
    Flex,
    FlexItem,
    Form,
    FormGroup,
    FormHelperText,
    Icon,
    Label,
    MenuToggle,
    MenuToggleElement,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    PageBreadcrumb,
    PageSection,
    Pagination,
    PaginationVariant,
    Popover,
    Radio,
    SearchInput,
    Select,
    SelectList,
    SelectOption,
    Stack,
    StackItem,
    Switch,
    Tab,
    Tabs,
    TabTitleText,
    TextArea,
    TextInput,
    Title,
    ToggleGroup,
    ToggleGroupItem,
    Toolbar,
    ToolbarContent,
    ToolbarGroup,
    ToolbarItem
} from '@patternfly/react-core';
import {
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr
} from '@patternfly/react-table';
import {
    ISortBy,
    SortByDirection,
} from '@patternfly/react-table';
import {
    ArrowDownIcon,
    ArrowUpIcon,
    CheckCircleIcon,
    CopyIcon,
    DatabaseIcon,
    DownloadIcon,
    EllipsisVIcon,
    ExclamationCircleIcon,
    ExternalLinkAltIcon,
    FilterIcon,
    InProgressIcon,
    OutlinedQuestionCircleIcon,
    RedhatIcon,
    RepositoryIcon,
    UploadIcon,
} from '@patternfly/react-icons';

interface Snapshot {
    date: string;
    changesAdded: number;
    changesRemoved: number;
    packages: number;
    advisories: number;
    isPublic?: boolean;
}

const generateSnapshotData = (repoName: string, hasPublicSnapshot?: boolean): Snapshot[] => {
    const snapshots: Snapshot[] = [];
    const baseDate = new Date(2026, 6, 27, 21, 49, 13);
    let packages = 25434;
    let advisories = 4738;

    for (let i = 0; i < 126; i++) {
        const date = new Date(baseDate.getTime() - i * (24 + Math.random() * 24) * 3600000);
        const added = Math.floor(Math.random() * 200);
        const removed = Math.floor(Math.random() * 200);
        snapshots.push({
            date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' - ' +
                  date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            changesAdded: added,
            changesRemoved: removed,
            packages,
            advisories,
            isPublic: hasPublicSnapshot && i === 2,
        });
        packages = Math.max(20000, packages - Math.floor(Math.random() * 50));
        advisories = Math.max(4600, advisories - Math.floor(Math.random() * 10));
    }
    return snapshots;
};

interface PackageInfo {
    name: string;
    version: string;
    release: string;
    architecture: string;
    lastIntrospection: string;
}

const generatePackageData = (): PackageInfo[] => {
    const packages: PackageInfo[] = [];
    const names = ['ipa-hcc', 'ipa-hcc-client', 'ipa-hcc-ephemeral', 'ipa-hcc-mockapi', 'ipa-hcc-selinux', 'ipa-hcc-server', 'ipa-hcc-registration-service', 'ipa-hcc-auto-enrollment', 'ipa-hcc-common'];
    const versions = ['0.18.git.l2.04c1e5ee', '0.18.git.l3.e4b7cf58'];
    const archs = ['src', 'noarch'];
    const introspections = ['10 months', 'a year ago', 'a day ago', 'a day ago'];

    for (const name of names) {
        for (let v = 0; v < versions.length; v++) {
            packages.push({
                name,
                version: versions[v],
                release: '1.el9',
                architecture: name === 'ipa-hcc' ? 'src' : 'noarch',
                lastIntrospection: introspections[v % introspections.length],
            });
        }
    }
    return packages;
};

interface Repository {
    id: string;
    name: string;
    url: string;
    architecture: 'Any' | 'x86_64' | 'aarch64';
    osVersion: 'RHEL 9' | 'RHEL 8' | 'Any';
    packages: number;
    lastIntrospection: string;
    status: 'Invalid' | 'Valid';
    source: 'redhat' | 'custom' | 'custom-upload' | 'partner';
    partnerName?: string;
    isPartner?: boolean;
    partnerLabel?: 'partnered' | 'published' | 'publishing';
    lastSnapshot?: string;
    changesAdded?: number;
    changesRemoved?: number;
}

const generateRepositoryData = (): Repository[] => {
    const repositories: Omit<Repository, 'id'>[] = [
        { name: 'rhel-9-for-x86_64-baseos-rpms', url: 'https://cdn.redhat.com/content/dist/rhel9/9/x86_64/baseos/os', architecture: 'x86_64', osVersion: 'RHEL 9', packages: 2847, lastIntrospection: '2 hours ago', status: 'Valid', source: 'redhat', lastSnapshot: '2 hours ago', changesAdded: 5, changesRemoved: 2 },
        { name: 'rhel-9-for-x86_64-appstream-rpms', url: 'https://cdn.redhat.com/content/dist/rhel9/9/x86_64/appstream/os', architecture: 'x86_64', osVersion: 'RHEL 9', packages: 5926, lastIntrospection: '2 hours ago', status: 'Valid', source: 'redhat', lastSnapshot: '2 hours ago', changesAdded: 12, changesRemoved: 3 },
        { name: 'rhel-8-for-x86_64-baseos-rpms', url: 'https://cdn.redhat.com/content/dist/rhel8/8/x86_64/baseos/os', architecture: 'x86_64', osVersion: 'RHEL 8', packages: 1789, lastIntrospection: '4 hours ago', status: 'Valid', source: 'redhat' },
        { name: 'rhel-8-for-x86_64-appstream-rpms', url: 'https://cdn.redhat.com/content/dist/rhel8/8/x86_64/appstream/os', architecture: 'x86_64', osVersion: 'RHEL 8', packages: 3421, lastIntrospection: '4 hours ago', status: 'Valid', source: 'redhat' },
        { name: 'custom-epel-repository', url: 'https://download.fedoraproject.org/pub/epel/9/Everything/x86_64/', architecture: 'Any', osVersion: 'Any', packages: 14203, lastIntrospection: '1 day ago', status: 'Invalid', source: 'custom' },
        { name: 'development-tools-repo', url: 'https://internal.company.com/repos/dev-tools/', architecture: 'x86_64', osVersion: 'RHEL 9', packages: 567, lastIntrospection: '3 days ago', status: 'Valid', source: 'custom', lastSnapshot: '3 days ago' },
        // Custom - upload with no partner label
        { name: 'company-rpm-upload', url: 'https://internal.company.com/repos/rpm-upload/', architecture: 'x86_64', osVersion: 'RHEL 9', packages: 412, lastIntrospection: '1 day ago', status: 'Valid', source: 'custom-upload', lastSnapshot: 'a day ago', changesAdded: 4, changesRemoved: 1 },
        { name: 'edge-packages-upload', url: 'https://internal.company.com/repos/edge-packages/', architecture: 'aarch64', osVersion: 'RHEL 9', packages: 156, lastIntrospection: '2 days ago', status: 'Valid', source: 'custom-upload', lastSnapshot: '2 days ago', changesAdded: 2, changesRemoved: 0 },
        { name: 'staging-artifacts', url: 'https://internal.company.com/repos/staging-artifacts/', architecture: 'x86_64', osVersion: 'RHEL 9', packages: 89, lastIntrospection: '5 hours ago', status: 'Valid', source: 'custom-upload', lastSnapshot: '5 hours ago', changesAdded: 7, changesRemoved: 3 },
        { name: 'qa-test-rpms', url: 'https://internal.company.com/repos/qa-test-rpms/', architecture: 'x86_64', osVersion: 'RHEL 8', packages: 64, lastIntrospection: '3 days ago', status: 'Valid', source: 'custom-upload', lastSnapshot: '3 days ago' },
        { name: 'internal-ml-tools', url: 'https://internal.company.com/repos/ml-tools/', architecture: 'x86_64', osVersion: 'RHEL 9', packages: 89, lastIntrospection: '5 days ago', status: 'Valid', source: 'custom-upload', lastSnapshot: '5 days ago' },
        // Custom - upload Partnered only
        { name: 'nvidia-cuda-rhel9-aarch64', url: 'https://developer.download.nvidia.com/compute/cuda/repos/rhel9/aarch64/', architecture: 'aarch64', osVersion: 'RHEL 9', packages: 743, lastIntrospection: '1 day ago', status: 'Valid', source: 'custom-upload', isPartner: true, partnerLabel: 'partnered', lastSnapshot: 'a day ago', changesAdded: 5, changesRemoved: 2 },
        { name: 'nvidia-fabric-manager-rhel9', url: 'https://developer.download.nvidia.com/compute/fabricmanager/repos/rhel9/', architecture: 'x86_64', osVersion: 'RHEL 9', packages: 128, lastIntrospection: '1 day ago', status: 'Valid', source: 'custom-upload', isPartner: true, partnerLabel: 'partnered', lastSnapshot: 'a day ago', changesAdded: 2, changesRemoved: 0 },
        // Custom - upload Partnered + Publishing in progress
        { name: 'nvidia-cuda-rhel9-x86_64', url: 'https://developer.download.nvidia.com/compute/cuda/repos/rhel9/x86_64/', architecture: 'x86_64', osVersion: 'RHEL 9', packages: 892, lastIntrospection: '6 hours ago', status: 'Valid', source: 'custom-upload', isPartner: true, partnerLabel: 'publishing', lastSnapshot: '6 hours ago', changesAdded: 3, changesRemoved: 1 },
        { name: 'nvidia-driver-rhel9-x86_64', url: 'https://developer.download.nvidia.com/compute/driver/repos/rhel9/x86_64/', architecture: 'x86_64', osVersion: 'RHEL 9', packages: 245, lastIntrospection: '12 hours ago', status: 'Valid', source: 'custom-upload', isPartner: true, partnerLabel: 'publishing', lastSnapshot: '12 hours ago', changesAdded: 1, changesRemoved: 0 },
        // Custom - upload Partnered + Published
        { name: 'nvidia-tensorrt-rhel9-x86_64', url: 'https://developer.download.nvidia.com/compute/tensorrt/repos/rhel9/x86_64/', architecture: 'x86_64', osVersion: 'RHEL 9', packages: 2150, lastIntrospection: '1 day ago', status: 'Valid', source: 'custom-upload', isPartner: true, partnerLabel: 'published', lastSnapshot: 'a day ago', changesAdded: 17, changesRemoved: 17 },
        { name: 'nvidia-cudnn-rhel9-x86_64', url: 'https://developer.download.nvidia.com/compute/cudnn/repos/rhel9/x86_64/', architecture: 'x86_64', osVersion: 'RHEL 9', packages: 1340, lastIntrospection: '1 day ago', status: 'Valid', source: 'custom-upload', isPartner: true, partnerLabel: 'published', lastSnapshot: 'a day ago', changesAdded: 8, changesRemoved: 4 },
        // Partner type (no labels, distinct names)
        { name: 'partner-cuda-drivers-rhel9', url: 'https://partner.example.com/cuda-drivers/rhel9/', architecture: 'x86_64', osVersion: 'RHEL 9', packages: 420, lastIntrospection: '1 day ago', status: 'Valid', source: 'partner', lastSnapshot: 'a day ago', changesAdded: 6, changesRemoved: 2 },
        { name: 'partner-ai-toolkit-rhel9', url: 'https://partner.example.com/ai-toolkit/rhel9/', architecture: 'x86_64', osVersion: 'RHEL 9', packages: 188, lastIntrospection: '2 days ago', status: 'Valid', source: 'partner', lastSnapshot: '2 days ago', changesAdded: 3, changesRemoved: 1 },
        { name: 'partner-gpu-stack-rhel9', url: 'https://partner.example.com/gpu-stack/rhel9/', architecture: 'aarch64', osVersion: 'RHEL 9', packages: 256, lastIntrospection: '3 days ago', status: 'Valid', source: 'partner', lastSnapshot: '3 days ago', changesAdded: 4, changesRemoved: 1 },
    ];

    return repositories.map((repo, index) => ({
        id: `repo-${index + 1}`,
        ...repo
    }));
};

const Repositories: React.FunctionComponent = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const typeParam = searchParams.get('type');

    const [repositories, setRepositories] = useState<Repository[]>(generateRepositoryData());
    const [searchValue, setSearchValue] = useState('');
    const [sortBy, setSortBy] = useState<ISortBy>({});
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterBy, setFilterBy] = useState('Name/URL');
    const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedRepositories, setSelectedRepositories] = useState<string[]>([]);
    const [repoToggles, setRepoToggles] = useState<Set<string>>(() => {
        if (typeParam) return new Set([typeParam]);
        return new Set(['redhat']);
    });
    const [isBulkSelectOpen, setIsBulkSelectOpen] = useState(false);
    const [isToolbarKebabOpen, setIsToolbarKebabOpen] = useState(false);
    const [openRowKebab, setOpenRowKebab] = useState<string | null>(null);
    const [isAddRepoModalOpen, setIsAddRepoModalOpen] = useState(false);
    const [snapshotRepo, setSnapshotRepo] = useState<Repository | null>(null);
    const [snapshotData, setSnapshotData] = useState<Snapshot[]>([]);
    const [snapshotPage, setSnapshotPage] = useState(1);
    const [snapshotPerPage, setSnapshotPerPage] = useState(20);
    const [snapshotSortBy, setSnapshotSortBy] = useState<ISortBy>({ index: 0, direction: SortByDirection.desc });
    const [openSnapshotKebab, setOpenSnapshotKebab] = useState<number | null>(null);
    const [snapshotDetailRepo, setSnapshotDetailRepo] = useState<Repository | null>(null);
    const [snapshotDetailSnap, setSnapshotDetailSnap] = useState<Snapshot | null>(null);
    const [snapshotDetailTab, setSnapshotDetailTab] = useState<string | number>(0);
    const [snapshotDetailFilter, setSnapshotDetailFilter] = useState('');
    const [snapshotDetailPage, setSnapshotDetailPage] = useState(1);
    const [snapshotDetailPerPage, setSnapshotDetailPerPage] = useState(20);
    const [isSnapshotSelectOpen, setIsSnapshotSelectOpen] = useState(false);
    const [publishChecked, setPublishChecked] = useState(false);
    const [partnerRequestRepo, setPartnerRequestRepo] = useState<Repository | null>(null);
    const [partnerRequestAgreed, setPartnerRequestAgreed] = useState(false);

    // Add repo form state
    const [formName, setFormName] = useState('');
    const [formRepoType, setFormRepoType] = useState('snapshotting');
    const [formUrl, setFormUrl] = useState('');
    const [formArch, setFormArch] = useState('Any');
    const [isFormArchOpen, setIsFormArchOpen] = useState(false);
    const [formOsVersion, setFormOsVersion] = useState('Any');
    const [isFormOsOpen, setIsFormOsOpen] = useState(false);
    const [formModularity, setFormModularity] = useState(true);
    const [formGpgKey, setFormGpgKey] = useState('');
    const [formMakePublic, setFormMakePublic] = useState(false);

    useEffect(() => {
        const type = searchParams.get('type');
        if (type) {
            setFilterBy('Name/URL');
            setSelectedType(null);
            setRepoToggles(new Set([type]));
            setPage(1);
        }
    }, [searchParams]);

    const resetForm = () => {
        setFormName('');
        setFormRepoType('snapshotting');
        setFormUrl('');
        setFormArch('Any');
        setFormOsVersion('Any');
        setFormModularity(true);
        setFormGpgKey('');
        setFormMakePublic(false);
    };

    const filteredAndSortedRepositories = useMemo(() => {
        let filtered = repositories;

        if (repoToggles.size > 0) {
            filtered = filtered.filter(repo => {
                if (repoToggles.has('redhat') && repo.source === 'redhat') return true;
                if (repoToggles.has('custom') && (repo.source === 'custom' || repo.source === 'custom-upload')) return true;
                if (repoToggles.has('partner') && repo.source === 'partner') return true;
                return false;
            });
        }

        if (searchValue && filterBy === 'Name/URL') {
            filtered = filtered.filter(repo =>
                repo.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                repo.url.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        if (selectedType) {
            if (selectedType === 'Red Hat') {
                filtered = filtered.filter(repo => repo.source === 'redhat');
            } else if (selectedType === 'Custom') {
                filtered = filtered.filter(repo => repo.source === 'custom');
            } else if (selectedType === 'Custom - upload') {
                filtered = filtered.filter(repo => repo.source === 'custom-upload');
            } else if (selectedType === 'Partner') {
                filtered = filtered.filter(repo => repo.source === 'partner');
            }
        }

        if (sortBy.index !== undefined) {
            const { index, direction } = sortBy;
            filtered = [...filtered].sort((a, b) => {
                let aValue, bValue;
                switch (index) {
                    case 0: aValue = a.name; bValue = b.name; break;
                    case 1: aValue = a.source; bValue = b.source; break;
                    case 2: aValue = a.architecture; bValue = b.architecture; break;
                    case 3: aValue = a.osVersion; bValue = b.osVersion; break;
                    case 4: aValue = a.packages; bValue = b.packages; break;
                    case 5: aValue = a.lastIntrospection; bValue = b.lastIntrospection; break;
                    case 6: aValue = a.status; bValue = b.status; break;
                    default: return 0;
                }

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    const result = aValue.localeCompare(bValue);
                    return direction === SortByDirection.asc ? result : -result;
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return direction === SortByDirection.asc ? aValue - bValue : bValue - aValue;
                }
                return 0;
            });
        }

        return filtered;
    }, [repositories, searchValue, sortBy, repoToggles, filterBy, selectedType]);

    const paginatedRepositories = useMemo(() => {
        const startIdx = (page - 1) * perPage;
        return filteredAndSortedRepositories.slice(startIdx, startIdx + perPage);
    }, [filteredAndSortedRepositories, page, perPage]);

    const getSortParams = useCallback((columnIndex: number) => ({
        sort: {
            sortBy,
            onSort: (_event: any, index: number, direction: 'asc' | 'desc') => {
                setSortBy({ index, direction });
            },
            columnIndex
        }
    }), [sortBy]);

    const TypeDisplay = ({ repository }: { repository: Repository }) => {
        const iconMap: Record<Repository['source'], React.ReactNode> = {
            redhat: <RedhatIcon />,
            custom: <DatabaseIcon />,
            'custom-upload': <UploadIcon />,
            partner: <RepositoryIcon />,
        };
        const labelMap: Record<Repository['source'], string> = {
            redhat: 'Red Hat',
            custom: 'Custom',
            'custom-upload': 'Custom - upload',
            partner: 'Partner',
        };
        return (
            <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem><Icon isInline>{iconMap[repository.source]}</Icon></FlexItem>
                <FlexItem>{labelMap[repository.source]}</FlexItem>
            </Flex>
        );
    };

    const StatusDisplay = ({ status }: { status: 'Valid' | 'Invalid' }) => (
        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
                <Icon status={status === 'Valid' ? 'success' : 'danger'}>
                    {status === 'Valid' ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
                </Icon>
            </FlexItem>
            <FlexItem>{status}</FlexItem>
        </Flex>
    );

    const handleSelectAll = (isSelected: boolean) => {
        if (isSelected) {
            setSelectedRepositories(paginatedRepositories.map(repo => repo.id));
        } else {
            setSelectedRepositories([]);
        }
        setIsBulkSelectOpen(false);
    };

    const isAllSelected = paginatedRepositories.length > 0 && selectedRepositories.length === paginatedRepositories.length;
    const isPartiallySelected = selectedRepositories.length > 0 && selectedRepositories.length < paginatedRepositories.length;

    const popoverHelp = (fieldLabel: string, helpText: string) => (
        <Popover bodyContent={helpText}>
            <button
                type="button"
                aria-label={`More info for ${fieldLabel}`}
                onClick={(e) => e.preventDefault()}
                className="pf-v6-c-form__group-label-help"
            >
                <OutlinedQuestionCircleIcon />
            </button>
        </Popover>
    );

    return (
        <>
            <PageBreadcrumb>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Button variant="link" isInline onClick={() => navigate('/content-management')}>
                            Content
                        </Button>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Button variant="link" isInline onClick={() => navigate('/content-management')}>
                            Templates
                        </Button>
                    </BreadcrumbItem>
                    <BreadcrumbItem isActive>Repositories</BreadcrumbItem>
                </Breadcrumb>
            </PageBreadcrumb>

            <PageSection aria-label="Repositories title">
                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsNone' }}>
                    <FlexItem>
                        <Title headingLevel="h1" size="2xl">Repositories</Title>
                    </FlexItem>
                    <FlexItem>
                        <Popover
                            headerContent="About repositories"
                            bodyContent={
                                <div>
                                    <p>Manage content repositories for manual snapshots and custom repository sources.</p>
                                    <p>To manage templates and set up content patching workflows, go to the Content Management page.</p>
                                </div>
                            }
                            position="right"
                        >
                            <Button variant="plain" aria-label="Help for Repositories">
                                <OutlinedQuestionCircleIcon />
                            </Button>
                        </Popover>
                    </FlexItem>
                </Flex>
                <p style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: '8px' }}>
                    Manage custom repositories for use within templates and content management workflows.
                    <br />
                    To manage templates and set up content patching workflows, go to the{' '}
                    <Button variant="link" isInline onClick={() => navigate('/content-management')}>
                        Templates
                    </Button>{' '}
                    page.
                </p>
            </PageSection>

            <PageSection aria-label="Repositories" isFilled>
                <Toolbar id="repositories-toolbar" inset={{ default: 'insetNone' }} className="app-repositories-toolbar">
                    <ToolbarContent>
                        <ToolbarItem>
                            <Dropdown
                                isOpen={isBulkSelectOpen}
                                onOpenChange={setIsBulkSelectOpen}
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                    <MenuToggle
                                        ref={toggleRef}
                                        onClick={() => setIsBulkSelectOpen(!isBulkSelectOpen)}
                                        aria-label="Bulk select"
                                    >
                                        <Checkbox
                                            id="bulk-select-dropdown"
                                            isChecked={isAllSelected ? true : isPartiallySelected ? null : false}
                                            onChange={(_event, isSelected) => handleSelectAll(isSelected)}
                                            aria-label="Select all repositories"
                                        />
                                        {selectedRepositories.length > 0 && ` ${selectedRepositories.length} selected`}
                                    </MenuToggle>
                                )}
                            >
                                <DropdownList>
                                    <DropdownItem onClick={() => setSelectedRepositories([])}>
                                        Select none (0 items)
                                    </DropdownItem>
                                    <DropdownItem onClick={() => setSelectedRepositories(paginatedRepositories.map(r => r.id))}>
                                        Select page ({paginatedRepositories.length} items)
                                    </DropdownItem>
                                    <DropdownItem onClick={() => setSelectedRepositories(filteredAndSortedRepositories.map(r => r.id))}>
                                        Select all ({filteredAndSortedRepositories.length} items)
                                    </DropdownItem>
                                </DropdownList>
                            </Dropdown>
                        </ToolbarItem>
                        <ToolbarGroup className="app-toolbar-filter-group">
                            <ToolbarItem>
                                <Select
                                    id="repository-filter-select"
                                    isOpen={isFilterOpen}
                                    selected={filterBy}
                                    onSelect={(_event, selection) => {
                                        setFilterBy(selection as string);
                                        setIsFilterOpen(false);
                                        if (selection !== 'Type') {
                                            setSelectedType(null);
                                        }
                                        if (selection === 'Type') {
                                            setSearchValue('');
                                        }
                                    }}
                                    onOpenChange={(isOpen) => setIsFilterOpen(isOpen)}
                                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                        <MenuToggle ref={toggleRef} onClick={() => setIsFilterOpen(!isFilterOpen)}>
                                            <FilterIcon /> {filterBy}
                                        </MenuToggle>
                                    )}
                                >
                                    <SelectList>
                                        <SelectOption value="Name/URL">Name/URL</SelectOption>
                                        <SelectOption value="Type">Type</SelectOption>
                                    </SelectList>
                                </Select>
                            </ToolbarItem>
                            <ToolbarItem>
                                {filterBy === 'Type' ? (
                                    <Select
                                        id="repository-type-filter-select"
                                        isOpen={isTypeFilterOpen}
                                        selected={selectedType}
                                        onSelect={(_event, selection) => {
                                            setSelectedType(selection as string);
                                            setIsTypeFilterOpen(false);
                                            setPage(1);
                                        }}
                                        onOpenChange={(isOpen) => setIsTypeFilterOpen(isOpen)}
                                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                            <MenuToggle ref={toggleRef} onClick={() => setIsTypeFilterOpen(!isTypeFilterOpen)}>
                                                {selectedType || 'Filter by type'}
                                            </MenuToggle>
                                        )}
                                    >
                                        <SelectList>
                                            <SelectOption value="Red Hat">Red Hat</SelectOption>
                                            <SelectOption value="Custom">Custom</SelectOption>
                                            <SelectOption value="Custom - upload">Custom - upload</SelectOption>
                                            <SelectOption value="Partner">Partner</SelectOption>
                                        </SelectList>
                                    </Select>
                                ) : (
                                    <SearchInput
                                        placeholder="Search repositories"
                                        value={searchValue}
                                        onChange={(_event, value) => setSearchValue(value)}
                                        onClear={() => setSearchValue('')}
                                    />
                                )}
                            </ToolbarItem>
                        </ToolbarGroup>
                        <ToolbarItem>
                            <ToggleGroup aria-label="Repository type">
                                <ToggleGroupItem
                                    text="Red Hat"
                                    buttonId="toggle-redhat"
                                    isSelected={repoToggles.has('redhat')}
                                    onChange={() => {
                                        setRepoToggles(prev => {
                                            const next = new Set(prev);
                                            next.has('redhat') ? next.delete('redhat') : next.add('redhat');
                                            return next;
                                        });
                                        setSelectedRepositories([]); setPage(1);
                                    }}
                                />
                                <ToggleGroupItem
                                    text="Custom"
                                    buttonId="toggle-custom"
                                    isSelected={repoToggles.has('custom')}
                                    onChange={() => {
                                        setRepoToggles(prev => {
                                            const next = new Set(prev);
                                            next.has('custom') ? next.delete('custom') : next.add('custom');
                                            return next;
                                        });
                                        setSelectedRepositories([]); setPage(1);
                                    }}
                                />
                                <ToggleGroupItem
                                    text="Partner"
                                    buttonId="toggle-partner"
                                    isSelected={repoToggles.has('partner')}
                                    onChange={() => {
                                        setRepoToggles(prev => {
                                            const next = new Set(prev);
                                            next.has('partner') ? next.delete('partner') : next.add('partner');
                                            return next;
                                        });
                                        setSelectedRepositories([]); setPage(1);
                                    }}
                                />
                            </ToggleGroup>
                        </ToolbarItem>
                        <ToolbarItem>
                            <Button variant="primary" onClick={() => { resetForm(); setIsAddRepoModalOpen(true); }}>
                                Add repositories
                            </Button>
                        </ToolbarItem>
                        <ToolbarItem>
                            <Dropdown
                                isOpen={isToolbarKebabOpen}
                                onOpenChange={setIsToolbarKebabOpen}
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                    <MenuToggle
                                        ref={toggleRef}
                                        variant="plain"
                                        onClick={() => setIsToolbarKebabOpen(!isToolbarKebabOpen)}
                                    >
                                        <EllipsisVIcon />
                                    </MenuToggle>
                                )}
                            >
                                <DropdownList>
                                    <DropdownItem>Remove</DropdownItem>
                                </DropdownList>
                            </Dropdown>
                        </ToolbarItem>
                        <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                            <Pagination
                                itemCount={filteredAndSortedRepositories.length}
                                widgetId="repositories-pagination-top"
                                perPage={perPage}
                                page={page}
                                variant={PaginationVariant.top}
                                onSetPage={(_event, newPage) => setPage(newPage)}
                                onPerPageSelect={(_event, newPerPage) => {
                                    setPerPage(newPerPage);
                                    setPage(1);
                                }}
                                isCompact
                            />
                        </ToolbarItem>
                    </ToolbarContent>
                </Toolbar>

                <Table aria-label="Repositories table" variant="compact" className="app-repositories-table">
                    <Thead>
                        <Tr>
                            <Th />
                            <Th {...getSortParams(0)}>Name</Th>
                            <Th {...getSortParams(1)} width={10}>Type</Th>
                            <Th {...getSortParams(2)} width={10}>Architecture</Th>
                            <Th {...getSortParams(3)} width={10}>OS version</Th>
                            <Th {...getSortParams(4)} width={10}>Packages</Th>
                            <Th {...getSortParams(5)} width={15}>Last introspection</Th>
                            <Th {...getSortParams(6)} width={10}>Status</Th>
                            <Th aria-label="Row actions" />
                        </Tr>
                    </Thead>
                    <Tbody>
                        {paginatedRepositories.map((repository) => (
                            <Tr key={repository.id}>
                                <Td
                                    select={{
                                        rowIndex: parseInt(repository.id.split('-')[1]) - 1,
                                        onSelect: (_event, isSelected) => {
                                            if (isSelected) {
                                                setSelectedRepositories(prev => [...prev, repository.id]);
                                            } else {
                                                setSelectedRepositories(prev => prev.filter(id => id !== repository.id));
                                            }
                                        },
                                        isSelected: selectedRepositories.includes(repository.id)
                                    }}
                                />
                                <Td dataLabel="Name">
                                    <div>
                                        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                                            <FlexItem>{repository.name}</FlexItem>
                                            {repository.source === 'custom-upload' && repository.partnerLabel && (
                                                <FlexItem><Label color="purple" isCompact>Partnered</Label></FlexItem>
                                            )}
                                            {repository.source === 'custom-upload' && repository.partnerLabel === 'published' && (
                                                <FlexItem><Label color="green" isCompact>Published</Label></FlexItem>
                                            )}
                                            {repository.source === 'custom-upload' && repository.partnerLabel === 'publishing' && (
                                                <FlexItem>
                                                    <Label variant="outline" color="green" isCompact icon={<InProgressIcon />}>
                                                        Publishing in progress
                                                    </Label>
                                                </FlexItem>
                                            )}
                                        </Flex>
                                        <div style={{ fontSize: '0.875rem' }}>
                                            <a href={repository.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pf-t--global--color--brand--default)', textDecoration: 'none' }}>
                                                {repository.url}{' '}
                                                <ExternalLinkAltIcon style={{ fontSize: '0.75em' }} />
                                            </a>
                                        </div>
                                        {repository.lastSnapshot && (
                                            <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                                Last snapshot {repository.lastSnapshot}
                                                {repository.changesAdded !== undefined && (
                                                    <span style={{ marginLeft: '16px' }}>
                                                        Changes:{' '}
                                                        <ArrowUpIcon style={{ color: 'var(--pf-t--global--color--status--success--default)', fontSize: '0.85em' }} />{' '}
                                                        <span style={{ color: 'var(--pf-t--global--color--status--success--default)' }}>{repository.changesAdded}</span>
                                                        {'  '}
                                                        <ArrowDownIcon style={{ color: 'var(--pf-t--global--color--status--danger--default)', fontSize: '0.85em' }} />{' '}
                                                        <span style={{ color: 'var(--pf-t--global--color--status--danger--default)' }}>{repository.changesRemoved}</span>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Td>
                                <Td dataLabel="Type">
                                    <TypeDisplay repository={repository} />
                                </Td>
                                <Td dataLabel="Architecture">{repository.architecture}</Td>
                                <Td dataLabel="OS version">{repository.osVersion}</Td>
                                <Td dataLabel="Packages">
                                    <a href="#" style={{ color: 'var(--pf-t--global--color--brand--default)', textDecoration: 'none' }}>
                                        {repository.packages.toLocaleString()}
                                    </a>
                                </Td>
                                <Td dataLabel="Last introspection">{repository.lastIntrospection}</Td>
                                <Td dataLabel="Status">
                                    <StatusDisplay status={repository.status} />
                                </Td>
                                <Td isActionCell>
                                    <Dropdown
                                        isOpen={openRowKebab === repository.id}
                                        onOpenChange={(isOpen) => setOpenRowKebab(isOpen ? repository.id : null)}
                                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                            <MenuToggle
                                                ref={toggleRef}
                                                variant="plain"
                                                onClick={() => setOpenRowKebab(openRowKebab === repository.id ? null : repository.id)}
                                                aria-label={`Actions for ${repository.name}`}
                                            >
                                                <EllipsisVIcon />
                                            </MenuToggle>
                                        )}
                                        popperProps={{ position: 'right' }}
                                    >
                                        <DropdownList>
                                            <DropdownItem onClick={() => setOpenRowKebab(null)}>Edit</DropdownItem>
                                            <DropdownItem onClick={() => setOpenRowKebab(null)}>Introspect now</DropdownItem>
                                            <DropdownItem onClick={() => { setOpenRowKebab(null); setSnapshotData(generateSnapshotData(repository.name, repository.isPartner)); setSnapshotRepo(repository); setSnapshotPage(1); }}>View all snapshots</DropdownItem>
                                            <DropdownItem onClick={() => setOpenRowKebab(null)}>Trigger snapshot</DropdownItem>
                                            {repository.source === 'custom-upload' && !repository.partnerLabel && (
                                                <DropdownItem onClick={() => { setOpenRowKebab(null); setPartnerRequestRepo(repository); }}>
                                                    Mark as partner repository
                                                </DropdownItem>
                                            )}
                                        </DropdownList>
                                        <Divider />
                                        <DropdownList>
                                            <DropdownItem onClick={() => setOpenRowKebab(null)}>Delete</DropdownItem>
                                        </DropdownList>
                                    </Dropdown>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>

                <Pagination
                    itemCount={filteredAndSortedRepositories.length}
                    widgetId="repositories-pagination-bottom"
                    perPage={perPage}
                    page={page}
                    variant={PaginationVariant.bottom}
                    onSetPage={(_event, newPage) => setPage(newPage)}
                    onPerPageSelect={(_event, newPerPage) => {
                        setPerPage(newPerPage);
                        setPage(1);
                    }}
                />
            </PageSection>

            {/* Partner request modal */}
            {partnerRequestRepo && (
                <Modal
                    isOpen
                    onClose={() => { setPartnerRequestRepo(null); setPartnerRequestAgreed(false); }}
                    variant="small"
                    aria-label="Mark as partner repository"
                >
                    <ModalHeader title="Mark as partner repository" />
                    <ModalBody>
                        <Stack hasGutter>
                            <StackItem>
                                <p>
                                    To make snapshots of this repository public for other users,
                                    mark it as a partner repository first. Then you must manually select
                                    the snapshot you want to make public. Snapshots are not published automatically.
                                </p>
                            </StackItem>
                            <StackItem>
                                <a
                                    href="https://docs.redhat.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: 'var(--pf-t--global--color--brand--default)' }}
                                >
                                    Learn more about partner content
                                    {' '}<ExternalLinkAltIcon style={{ fontSize: '0.75em' }} />
                                </a>
                            </StackItem>
                            <StackItem>
                                <Checkbox
                                    id="partner-request-agree"
                                    label="I understand that snapshots must be published manually."
                                    isChecked={partnerRequestAgreed}
                                    onChange={(_event, checked) => setPartnerRequestAgreed(checked)}
                                />
                            </StackItem>
                        </Stack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="primary" isDisabled={!partnerRequestAgreed} onClick={() => {
                            setRepositories(prev => prev.map(r =>
                                r.id === partnerRequestRepo.id ? { ...r, isPartner: true, partnerLabel: 'partnered' as const } : r
                            ));
                            setPartnerRequestRepo(null);
                            setPartnerRequestAgreed(false);
                        }}>
                            Mark as partner repository
                        </Button>
                        <Button variant="link" onClick={() => { setPartnerRequestRepo(null); setPartnerRequestAgreed(false); }}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            )}

            {/* Snapshots modal */}
            {snapshotRepo && (
                <Modal
                    isOpen
                    onClose={() => setSnapshotRepo(null)}
                    variant="large"
                    aria-label="Snapshots"
                >
                    <ModalHeader title="Snapshots" />
                    <ModalBody>
                        <p style={{ color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '16px' }}>
                            View list of snapshots for <strong>{snapshotRepo.name}</strong> {snapshotRepo.architecture}.
                        </p>

                        {snapshotRepo.source === 'custom-upload' && snapshotRepo.partnerLabel && (
                            <Alert
                                variant="info"
                                isInline
                                title={`You can make snapshots of this repository publicly available for anyone to view and use by publishing them. Your organization label will be visible next to the repository.`}
                                style={{ marginBottom: '16px' }}
                            />
                        )}

                        <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ marginBottom: '16px' }}>
                            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                                <FlexItem><span style={{ fontWeight: 500 }}>Latest snapshot config:</span></FlexItem>
                                <FlexItem>
                                    <Button variant="plain" aria-label="Copy config"><CopyIcon /></Button>
                                </FlexItem>
                                <FlexItem>
                                    <Button variant="plain" aria-label="Download config"><DownloadIcon /></Button>
                                </FlexItem>
                                {snapshotRepo.source === 'custom-upload' && snapshotRepo.partnerLabel && (
                                    <FlexItem>
                                        <Button variant="link" isInline onClick={() => {
                                            const latestSnap = snapshotData[0];
                                            if (latestSnap) {
                                                setSnapshotDetailRepo(snapshotRepo);
                                                setSnapshotDetailSnap(latestSnap);
                                                setSnapshotDetailTab(0);
                                                setSnapshotDetailFilter('');
                                                setSnapshotDetailPage(1);
                                                setPublishChecked(false);
                                            }
                                        }}>
                                            Publish latest snapshot
                                        </Button>
                                    </FlexItem>
                                )}
                            </Flex>
                            <FlexItem>
                                <Pagination
                                    itemCount={snapshotData.length}
                                    perPage={snapshotPerPage}
                                    page={snapshotPage}
                                    variant={PaginationVariant.top}
                                    isCompact
                                    onSetPage={(_event, newPage) => setSnapshotPage(newPage)}
                                    onPerPageSelect={(_event, newPerPage) => { setSnapshotPerPage(newPerPage); setSnapshotPage(1); }}
                                />
                            </FlexItem>
                        </Flex>

                        <Table aria-label="Snapshots table" variant="compact">
                            <Thead>
                                <Tr>
                                    <Th sort={{
                                        sortBy: snapshotSortBy,
                                        onSort: (_e, idx, dir) => setSnapshotSortBy({ index: idx, direction: dir }),
                                        columnIndex: 0
                                    }}>Snapshots</Th>
                                    <Th>Change</Th>
                                    <Th>Packages</Th>
                                    <Th>Advisories</Th>
                                    <Th>Config</Th>
                                    {snapshotRepo.source === 'custom-upload' && snapshotRepo.partnerLabel && (
                                        <Th />
                                    )}
                                </Tr>
                            </Thead>
                            <Tbody>
                                {snapshotData
                                    .slice((snapshotPage - 1) * snapshotPerPage, snapshotPage * snapshotPerPage)
                                    .map((snap, idx) => (
                                    <Tr key={idx}>
                                        <Td dataLabel="Snapshots">
                                            <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                                                <FlexItem>
                                                    <Button variant="link" isInline onClick={() => {
                                                        setSnapshotDetailRepo(snapshotRepo);
                                                        setSnapshotDetailSnap(snap);
                                                        setSnapshotDetailTab(0);
                                                        setSnapshotDetailFilter('');
                                                        setSnapshotDetailPage(1);
                                                        setPublishChecked(false);
                                                    }}>
                                                        {snap.date}
                                                    </Button>
                                                </FlexItem>
                                                {snap.isPublic && (
                                                    <FlexItem><Label color="green" isCompact>Published</Label></FlexItem>
                                                )}
                                            </Flex>
                                        </Td>
                                        <Td dataLabel="Change">
                                            <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                                                <FlexItem>
                                                    <ArrowUpIcon style={{ color: 'var(--pf-t--global--color--status--success--default)', fontSize: '0.85em' }} />
                                                    {' '}
                                                    <span style={{ color: 'var(--pf-t--global--color--status--success--default)' }}>{snap.changesAdded}</span>
                                                </FlexItem>
                                                <FlexItem>
                                                    <ArrowDownIcon style={{ color: 'var(--pf-t--global--color--status--danger--default)', fontSize: '0.85em' }} />
                                                    {' '}
                                                    <span style={{ color: 'var(--pf-t--global--color--status--danger--default)' }}>{snap.changesRemoved}</span>
                                                </FlexItem>
                                            </Flex>
                                        </Td>
                                        <Td dataLabel="Packages">
                                            <a href="#" style={{ color: 'var(--pf-t--global--color--brand--default)', textDecoration: 'none' }}>
                                                {snap.packages.toLocaleString()}
                                            </a>
                                        </Td>
                                        <Td dataLabel="Advisories">
                                            <a href="#" style={{ color: 'var(--pf-t--global--color--brand--default)', textDecoration: 'none' }}>
                                                {snap.advisories.toLocaleString()}
                                            </a>
                                        </Td>
                                        <Td dataLabel="Config">
                                            <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                                                <FlexItem>
                                                    <Button variant="plain" aria-label="Copy config" size="sm"><CopyIcon /></Button>
                                                </FlexItem>
                                                <FlexItem>
                                                    <Button variant="plain" aria-label="Download config" size="sm"><DownloadIcon /></Button>
                                                </FlexItem>
                                            </Flex>
                                        </Td>
                                        {snapshotRepo.source === 'custom-upload' && snapshotRepo.partnerLabel && (
                                            <Td isActionCell>
                                                <Dropdown
                                                    isOpen={openSnapshotKebab === idx}
                                                    onSelect={() => setOpenSnapshotKebab(null)}
                                                    onOpenChange={(isOpen) => !isOpen && setOpenSnapshotKebab(null)}
                                                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                                        <MenuToggle
                                                            ref={toggleRef}
                                                            variant="plain"
                                                            onClick={() => setOpenSnapshotKebab(openSnapshotKebab === idx ? null : idx)}
                                                            isExpanded={openSnapshotKebab === idx}
                                                            aria-label="Snapshot actions"
                                                        >
                                                            <EllipsisVIcon />
                                                        </MenuToggle>
                                                    )}
                                                    popperProps={{ position: 'right' }}
                                                >
                                                    <DropdownList>
                                                        {!snap.isPublic && (
                                                            <DropdownItem onClick={() => {
                                                                setSnapshotDetailRepo(snapshotRepo);
                                                                setSnapshotDetailSnap(snap);
                                                                setSnapshotDetailTab(0);
                                                                setSnapshotDetailFilter('');
                                                                setSnapshotDetailPage(1);
                                                                setPublishChecked(false);
                                                                setOpenSnapshotKebab(null);
                                                            }}>
                                                                Publish snapshot
                                                            </DropdownItem>
                                                        )}
                                                        <DropdownItem
                                                            onClick={() => {
                                                                setSnapshotData(prev => prev.filter((_, i) => i !== ((snapshotPage - 1) * snapshotPerPage + idx)));
                                                                setOpenSnapshotKebab(null);
                                                            }}
                                                        >
                                                            Delete snapshot
                                                        </DropdownItem>
                                                    </DropdownList>
                                                </Dropdown>
                                            </Td>
                                        )}
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="secondary" onClick={() => setSnapshotRepo(null)}>Close</Button>
                    </ModalFooter>
                </Modal>
            )}

            {/* Snapshot detail modal */}
            {snapshotDetailRepo && snapshotDetailSnap && (() => {
                const packageData = generatePackageData();
                const canPublish = snapshotDetailRepo.source === 'custom-upload' && !!snapshotDetailRepo.partnerLabel;
                const filteredPackages = packageData.filter(p =>
                    !snapshotDetailFilter || p.name.toLowerCase().includes(snapshotDetailFilter.toLowerCase())
                );
                const pagedPackages = filteredPackages.slice(
                    (snapshotDetailPage - 1) * snapshotDetailPerPage,
                    snapshotDetailPage * snapshotDetailPerPage
                );

                return (
                    <Modal
                        isOpen
                        onClose={() => { setSnapshotDetailRepo(null); setSnapshotDetailSnap(null); setPublishChecked(false); }}
                        variant="large"
                        aria-label="Snapshot detail"
                    >
                        <ModalHeader title="Snapshot detail" />
                        <ModalBody>
                            <Stack hasGutter>
                                <StackItem>
                                    <Flex alignItems={{ default: 'alignItemsFlexStart' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                                        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                                            <FlexItem><strong>Snapshots</strong></FlexItem>
                                            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
                                                <FlexItem>
                                                    <Select
                                                        isOpen={isSnapshotSelectOpen}
                                                        onOpenChange={(isOpen) => setIsSnapshotSelectOpen(isOpen)}
                                                        onSelect={(_event, value) => {
                                                            const selected = snapshotData.find(s => s.date === value);
                                                            if (selected) {
                                                                setSnapshotDetailSnap(selected);
                                                                setPublishChecked(false);
                                                            }
                                                            setIsSnapshotSelectOpen(false);
                                                        }}
                                                        selected={snapshotDetailSnap.date}
                                                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                                            <MenuToggle
                                                                ref={toggleRef}
                                                                onClick={() => setIsSnapshotSelectOpen(!isSnapshotSelectOpen)}
                                                                isExpanded={isSnapshotSelectOpen}
                                                                style={{ minWidth: '260px' }}
                                                            >
                                                                {snapshotDetailSnap.date}
                                                            </MenuToggle>
                                                        )}
                                                    >
                                                        <SelectList>
                                                            {snapshotData.slice(0, 20).map((s, i) => (
                                                                <SelectOption key={i} value={s.date}>
                                                                    {s.date}
                                                                </SelectOption>
                                                            ))}
                                                        </SelectList>
                                                    </Select>
                                                </FlexItem>
                                                {snapshotDetailSnap.isPublic && (
                                                    <FlexItem>
                                                        <Label color="green" isCompact>Published</Label>
                                                    </FlexItem>
                                                )}
                                            </Flex>
                                        </Flex>
                                        <FlexItem>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setSnapshotDetailRepo(null);
                                                    setSnapshotDetailSnap(null);
                                                    setPublishChecked(false);
                                                }}
                                            >
                                                View all snapshots
                                            </Button>
                                        </FlexItem>
                                    </Flex>
                                </StackItem>
                                {canPublish && !snapshotDetailSnap.isPublic && (
                                    <StackItem>
                                        <Checkbox
                                            id="publish-snapshot-check"
                                            label={
                                                <Flex spaceItems={{ default: 'spaceItemsXs' }} alignItems={{ default: 'alignItemsCenter' }} style={{ display: 'inline-flex' }}>
                                                    <FlexItem>Publish this snapshot</FlexItem>
                                                    <FlexItem>
                                                        <Popover
                                                            bodyContent={
                                                                <div>
                                                                    <p>
                                                                        You can make this snapshot publicly available for anyone to view and use by publishing it.
                                                                        Your organization label will be visible next to the repository.
                                                                    </p>
                                                                    <a
                                                                        href="https://docs.redhat.com"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        Learn more about publishing snapshots
                                                                        {' '}<ExternalLinkAltIcon style={{ fontSize: '0.75em' }} />
                                                                    </a>
                                                                </div>
                                                            }
                                                        >
                                                            <Button
                                                                variant="plain"
                                                                aria-label="More info about publishing"
                                                                style={{ padding: 0 }}
                                                            >
                                                                <OutlinedQuestionCircleIcon />
                                                            </Button>
                                                        </Popover>
                                                    </FlexItem>
                                                </Flex>
                                            }
                                            description="You can make this snapshot publicly available for anyone to view and use by publishing it."
                                            isChecked={publishChecked}
                                            onChange={(_event, checked) => setPublishChecked(checked)}
                                        />
                                    </StackItem>
                                )}
                                <StackItem>
                                    <Tabs activeKey={snapshotDetailTab} onSelect={(_event, tabIndex) => setSnapshotDetailTab(tabIndex)}>
                                        <Tab eventKey={0} title={<TabTitleText>Packages</TabTitleText>} />
                                        <Tab eventKey={1} title={<TabTitleText>Advisories</TabTitleText>} />
                                    </Tabs>
                                </StackItem>
                                <StackItem>
                                    <Toolbar className="pf-v6-u-p-0">
                                        <ToolbarContent>
                                            <ToolbarItem>
                                                <Select
                                                    isOpen={false}
                                                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                                        <MenuToggle ref={toggleRef} icon={<FilterIcon />} style={{ minWidth: '120px' }}>
                                                            Name
                                                        </MenuToggle>
                                                    )}
                                                >
                                                    <SelectList>
                                                        <SelectOption value="Name">Name</SelectOption>
                                                    </SelectList>
                                                </Select>
                                            </ToolbarItem>
                                            <ToolbarItem>
                                                <SearchInput
                                                    placeholder="Filter by name"
                                                    value={snapshotDetailFilter}
                                                    onChange={(_event, value) => { setSnapshotDetailFilter(value); setSnapshotDetailPage(1); }}
                                                    onClear={() => { setSnapshotDetailFilter(''); setSnapshotDetailPage(1); }}
                                                />
                                            </ToolbarItem>
                                            <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                                                <Pagination
                                                    itemCount={filteredPackages.length}
                                                    perPage={snapshotDetailPerPage}
                                                    page={snapshotDetailPage}
                                                    variant={PaginationVariant.top}
                                                    isCompact
                                                    onSetPage={(_event, newPage) => setSnapshotDetailPage(newPage)}
                                                    onPerPageSelect={(_event, newPerPage) => { setSnapshotDetailPerPage(newPerPage); setSnapshotDetailPage(1); }}
                                                />
                                            </ToolbarItem>
                                        </ToolbarContent>
                                    </Toolbar>
                                </StackItem>
                                <StackItem>
                                    <Table aria-label="Snapshot packages table" variant="compact">
                                        <Thead>
                                            <Tr>
                                                <Th>Name</Th>
                                                <Th>Version</Th>
                                                <Th>Release</Th>
                                                <Th>Architecture</Th>
                                                <Th>Last introspection</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {pagedPackages.map((pkg, idx) => (
                                                <Tr key={idx}>
                                                    <Td dataLabel="Name">{pkg.name}</Td>
                                                    <Td dataLabel="Version">{pkg.version}</Td>
                                                    <Td dataLabel="Release">{pkg.release}</Td>
                                                    <Td dataLabel="Architecture">{pkg.architecture}</Td>
                                                    <Td dataLabel="Last introspection">{pkg.lastIntrospection}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </StackItem>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            {canPublish && !snapshotDetailSnap.isPublic && (
                                <Button
                                    variant="secondary"
                                    isDisabled={!publishChecked}
                                    onClick={() => {
                                        setSnapshotData(prev => prev.map(s =>
                                            s.date === snapshotDetailSnap.date ? { ...s, isPublic: true } : s
                                        ));
                                        setSnapshotDetailSnap({ ...snapshotDetailSnap, isPublic: true });
                                        setPublishChecked(false);
                                    }}
                                >
                                    Publish snapshot
                                </Button>
                            )}
                            <Button variant="link" onClick={() => { setSnapshotDetailRepo(null); setSnapshotDetailSnap(null); setPublishChecked(false); }}>
                                Close
                            </Button>
                        </ModalFooter>
                    </Modal>
                );
            })()}

            {/* Add custom repositories modal */}
            <Modal
                isOpen={isAddRepoModalOpen}
                onClose={() => setIsAddRepoModalOpen(false)}
                variant="medium"
                aria-label="Add custom repositories"
            >
                <ModalHeader
                    title="Add custom repositories"
                    description="Add by completing the form. Default values provided"
                    help={
                        <Popover
                            bodyContent="Custom repositories allow you to manage external content sources for use with templates and system patching."
                        >
                            <Button variant="plain" aria-label="More info">
                                <OutlinedQuestionCircleIcon />
                            </Button>
                        </Popover>
                    }
                />
                <ModalBody>
                    <Form>
                        <FormGroup label="Name" isRequired fieldId="form-name">
                            <TextInput
                                isRequired
                                id="form-name"
                                value={formName}
                                onChange={(_event, value) => setFormName(value)}
                                placeholder="Enter name"
                            />
                        </FormGroup>

                        <FormGroup label="Repository type" fieldId="form-repo-type" role="radiogroup">
                            <Radio
                                id="repo-type-snapshotting"
                                name="repo-type"
                                label="Snapshotting"
                                description="Enable snapshotting for an external repository. The remote repository will be checked for updates and packages will be downloaded, enabling you to build images and use templates with historical snapshots."
                                isChecked={formRepoType === 'snapshotting'}
                                onChange={() => { setFormRepoType('snapshotting'); setFormMakePublic(false); }}
                            />
                            <Radio
                                id="repo-type-introspect"
                                name="repo-type"
                                label="Introspect only"
                                isChecked={formRepoType === 'introspect'}
                                onChange={() => { setFormRepoType('introspect'); setFormMakePublic(false); }}
                            />
                            <Radio
                                id="repo-type-upload"
                                name="repo-type"
                                label="Upload"
                                isChecked={formRepoType === 'upload'}
                                onChange={() => setFormRepoType('upload')}
                            />
                        </FormGroup>

                        <FormGroup label="URL" isRequired fieldId="form-url">
                            <TextInput
                                isRequired
                                id="form-url"
                                value={formUrl}
                                onChange={(_event, value) => setFormUrl(value)}
                                placeholder="https://"
                            />
                        </FormGroup>

                        <FormGroup
                            label="Restrict architecture"
                            labelHelp={popoverHelp('Restrict architecture', 'Restrict this repository to a specific architecture. Selecting "Any" allows all architectures.')}
                            fieldId="form-arch"
                        >
                            <Select
                                id="form-arch"
                                isOpen={isFormArchOpen}
                                selected={formArch}
                                onSelect={(_event, selection) => {
                                    setFormArch(selection as string);
                                    setIsFormArchOpen(false);
                                }}
                                onOpenChange={setIsFormArchOpen}
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                    <MenuToggle
                                        ref={toggleRef}
                                        onClick={() => setIsFormArchOpen(!isFormArchOpen)}
                                        isExpanded={isFormArchOpen}
                                        isFullWidth
                                    >
                                        {formArch}
                                    </MenuToggle>
                                )}
                            >
                                <SelectList>
                                    <SelectOption value="Any">Any</SelectOption>
                                    <SelectOption value="x86_64">x86_64</SelectOption>
                                    <SelectOption value="aarch64">aarch64</SelectOption>
                                </SelectList>
                            </Select>
                        </FormGroup>

                        <FormGroup
                            label="Restrict OS version"
                            labelHelp={popoverHelp('Restrict OS version', 'Restrict this repository to specific OS versions. Selecting "Any" allows all versions.')}
                            fieldId="form-os-version"
                        >
                            <Select
                                id="form-os-version"
                                isOpen={isFormOsOpen}
                                selected={formOsVersion}
                                onSelect={(_event, selection) => {
                                    setFormOsVersion(selection as string);
                                    setIsFormOsOpen(false);
                                }}
                                onOpenChange={setIsFormOsOpen}
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                    <MenuToggle
                                        ref={toggleRef}
                                        onClick={() => setIsFormOsOpen(!isFormOsOpen)}
                                        isExpanded={isFormOsOpen}
                                        isFullWidth
                                    >
                                        {formOsVersion}
                                    </MenuToggle>
                                )}
                            >
                                <SelectList>
                                    <SelectOption value="Any">Any</SelectOption>
                                    <SelectOption value="RHEL 9">RHEL 9</SelectOption>
                                    <SelectOption value="RHEL 8">RHEL 8</SelectOption>
                                </SelectList>
                            </Select>
                        </FormGroup>

                        <FormGroup
                            label="Modularity filtering enabled"
                            labelHelp={popoverHelp('Modularity filtering enabled', 'When enabled, modular RPMs will be filtered based on their module streams.')}
                            fieldId="form-modularity"
                        >
                            <Switch
                                id="form-modularity"
                                label="Modularity filtering enabled"
                                hasCheckIcon
                                isChecked={formModularity}
                                onChange={(_event, checked) => setFormModularity(checked)}
                            />
                        </FormGroup>

                        <FormGroup
                            label="GPG key"
                            labelHelp={popoverHelp('GPG key', 'A GPG key used to verify the authenticity of packages in this repository. You can upload a key file or paste the key content directly.')}
                            fieldId="form-gpg-key"
                        >
                            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                                <FlexItem>
                                    <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                                        <FlexItem grow={{ default: 'grow' }}>
                                            <TextInput
                                                id="form-gpg-file"
                                                placeholder="Drag a file here or upload one"
                                                readOnly
                                            />
                                        </FlexItem>
                                        <FlexItem>
                                            <Button variant="secondary" icon={<UploadIcon />}>Upload</Button>
                                        </FlexItem>
                                        <FlexItem>
                                            <Button variant="secondary">Clear</Button>
                                        </FlexItem>
                                    </Flex>
                                </FlexItem>
                                <FlexItem>
                                    <TextArea
                                        id="form-gpg-key"
                                        value={formGpgKey}
                                        onChange={(_event, value) => setFormGpgKey(value)}
                                        placeholder="Paste GPG key or URL here"
                                        rows={4}
                                        resizeOrientation="vertical"
                                    />
                                </FlexItem>
                            </Flex>
                        </FormGroup>

                        {formRepoType === 'upload' && (
                            <>
                                <Divider className="pf-v6-u-my-md" />

                                <FormGroup
                                    label="Mark as partner"
                                    labelHelp={popoverHelp('Mark as partner', 'To make snapshots of this repository public for other users, mark it as a partner repository first. Then you must manually select the snapshot you want to make public. Snapshots are not published automatically.')}
                                    fieldId="form-publication"
                                >
                                    <FormHelperText style={{ marginBottom: '8px' }}>
                                        <p>Mark this repository as partner content for other users to view and use.</p>
                                    </FormHelperText>
                                    <Switch
                                        id="form-publication"
                                        label="Mark as partner repository"
                                        hasCheckIcon
                                        isChecked={formMakePublic}
                                        onChange={(_event, checked) => setFormMakePublic(checked)}
                                    />
                                </FormGroup>
                            </>
                        )}

                        <ActionGroup>
                            <Dropdown
                                isOpen={false}
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                    <MenuToggle
                                        ref={toggleRef}
                                        splitButtonItems={[
                                            <Button key="save" variant="primary" onClick={() => setIsAddRepoModalOpen(false)}>
                                                Save
                                            </Button>
                                        ]}
                                        variant="primary"
                                    />
                                )}
                            >
                                <DropdownList>
                                    <DropdownItem>Save and add another</DropdownItem>
                                </DropdownList>
                            </Dropdown>
                        </ActionGroup>
                    </Form>
                </ModalBody>
            </Modal>
        </>
    );
};

export { Repositories };
