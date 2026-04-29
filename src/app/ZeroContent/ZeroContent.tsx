import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Card,
    CardBody,
    Flex,
    FlexItem,
    Title
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

const bodyFont: React.CSSProperties = {
    fontFamily: '"Red Hat Display", var(--pf-t--global--font--family--body)',
    fontSize: '16px',
    color: '#ffffff'
};

const ZeroContent: React.FunctionComponent = () => {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: 'var(--pf-t--global--background--color--primary)' }}>
            <div style={{ padding: '16px 24px' }}>
                <Breadcrumb>
                    <BreadcrumbItem component="button" onClick={() => navigate('/')}>
                        RHEL
                    </BreadcrumbItem>
                    <BreadcrumbItem component="button" onClick={() => navigate('/content-management')}>
                        Content
                    </BreadcrumbItem>
                    <BreadcrumbItem isActive>Content Management</BreadcrumbItem>
                </Breadcrumb>
            </div>

            <div style={{
                backgroundColor: '#151515',
                color: '#ffffff',
                padding: '64px 48px',
                marginBottom: '24px'
            }}>
                <Flex direction={{ default: 'row' }} style={{ gap: '24px' }} alignItems={{ default: 'alignItemsStretch' }}>
                    <FlexItem flex={{ default: 'flex_3' }}>
                        <Title headingLevel="h1" size="2xl" style={{ color: '#ffffff', marginBottom: '16px', fontSize: '36px' }}>
                            Content lifecycle management
                        </Title>
                        <p style={{ ...bodyFont, marginBottom: '24px' }}>
                            Manage system content and patch updates by creating content templates that control which advisories and package versions are applied to your RHEL systems.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <span style={{
                                    color: '#F0AB00',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    flexShrink: 0,
                                    lineHeight: '1'
                                }}>+</span>
                                <span style={bodyFont}>
                                    Create templates with repository snapshots to control exactly when updates are applied and to ensure identical patch levels across your fleet.
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <span style={{
                                    color: '#F0AB00',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    flexShrink: 0,
                                    lineHeight: '1'
                                }}>+</span>
                                <span style={bodyFont}>
                                    Integrate custom content: Manage external repositories and your own RPMs alongside Red Hat sources.
                                </span>
                            </div>
                        </div>
                    </FlexItem>

                    <FlexItem flex={{ default: 'flex_3' }} style={{ display: 'flex' }}>
                        <Card style={{ backgroundColor: '#ffffff', color: '#151515', flex: 1, display: 'flex' }}>
                            <CardBody style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '24px 24px' }}>
                                <Title headingLevel="h2" size="lg" style={{ textAlign: 'center', fontSize: '24px' }}>
                                    Start using content templates now
                                </Title>
                                <p style={{ color: '#6a6e73', fontSize: '16px', textAlign: 'center', margin: 0 }}>
                                    Get started by creating a content template to manage updates<br />
                                    for your RHEL systems or adding external repositories.
                                </p>
                                <Button
                                    variant="primary"
                                    onClick={() => navigate('/templates')}
                                >
                                    Create template
                                </Button>
                                <Button variant="link" onClick={() => navigate('/repositories')}>
                                    Add repositories
                                </Button>
                            </CardBody>
                        </Card>
                    </FlexItem>
                </Flex>
            </div>

            <div style={{ padding: '0 24px 24px' }}>
                <Flex direction={{ default: 'row' }} gap={{ default: 'gapLg' }} alignItems={{ default: 'alignItemsStretch' }}>
                    <FlexItem flex={{ default: 'flex_1' }} style={{ display: 'flex' }}>
                        <Card isFullHeight style={{ flex: 1 }}>
                            <CardBody>
                                <Title headingLevel="h2" size="lg" style={{ marginBottom: '12px' }}>
                                    About content templates
                                </Title>
                                <p style={{ color: '#6a6e73', marginBottom: '16px', fontSize: '14px' }}>
                                    Content templates use repository snapshots to control which advisories and package versions are applied when patching your RHEL systems.
                                </p>
                                <p style={{ color: '#6a6e73', marginBottom: '24px', fontSize: '14px' }}>
                                    Use templates to define a Standard Operating Environment (SOE) by pinning repositories to a specific point in time. This ensures a consistent baseline of tested packages and advisories across your fleet.
                                </p>
                                <div>
                                    <Button
                                        variant="link"
                                        isInline
                                        component="a"
                                        href="https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html/managing_system_content_and_patch_updates_on_rhel_systems/index"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        icon={<ExternalLinkAltIcon />}
                                        iconPosition="right"
                                        style={{ padding: 0, fontSize: '14px' }}
                                    >
                                        Learn more about managing system content and patch updates
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </FlexItem>
                    <FlexItem flex={{ default: 'flex_1' }} style={{ display: 'flex' }}>
                        <Card isFullHeight style={{ flex: 1 }}>
                            <CardBody>
                                <Title headingLevel="h2" size="lg" style={{ marginBottom: '12px' }}>
                                    About repositories
                                </Title>
                                <p style={{ color: '#6a6e73', marginBottom: '16px', fontSize: '14px' }}>
                                    Repositories provide the content sources that templates use to define what packages and advisories are available to your systems.
                                </p>
                                <p style={{ color: '#6a6e73', marginBottom: '24px', fontSize: '14px' }}>
                                    You can use official Red Hat content, add external sources, or upload custom RPMs.
                                </p>
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate('/repositories')}
                                    style={{ marginBottom: '16px' }}
                                >
                                    Browse available repositories
                                </Button>
                                <div>
                                    <Button
                                        variant="link"
                                        isInline
                                        component="a"
                                        href="https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html/managing_system_content_and_patch_updates_on_rhel_systems/index"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        icon={<ExternalLinkAltIcon />}
                                        iconPosition="right"
                                        style={{ padding: 0, fontSize: '14px' }}
                                    >
                                        Learn more about repositories
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </FlexItem>
                </Flex>
            </div>
        </div>
    );
};

export { ZeroContent };
