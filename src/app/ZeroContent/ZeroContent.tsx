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

const ZeroContent: React.FunctionComponent = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '24px', backgroundColor: 'var(--pf-t--global--background--color--primary)' }}>
            {/* Breadcrumb */}
            <Breadcrumb style={{ marginBottom: '16px' }}>
                <BreadcrumbItem component="button" onClick={() => navigate('/')}>
                    RHEL
                </BreadcrumbItem>
                <BreadcrumbItem component="button" onClick={() => navigate('/content-management')}>
                    Content
                </BreadcrumbItem>
                <BreadcrumbItem isActive>Content Management</BreadcrumbItem>
            </Breadcrumb>

            {/* Dark themed main section */}
            <div style={{
                backgroundColor: '#151515',
                color: '#ffffff',
                padding: '48px',
                borderRadius: '8px',
                marginBottom: '24px',
                position: 'relative'
            }}>
                <Flex direction={{ default: 'row' }} gap={{ default: 'gapLg' }}>
                    {/* Left side - Features */}
                    <FlexItem flex={{ default: 'flex_1' }}>
                        <Title headingLevel="h1" size="2xl" style={{ color: '#ffffff', marginBottom: '16px' }}>
                            Content management
                        </Title>
                        <p style={{ color: '#ffffff', marginBottom: '32px', fontSize: '16px' }}>
                            Manage system content and patch updates by creating content templates that control which advisories and package versions are applied to your RHEL systems.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <p style={{ color: '#ffffff', margin: 0, fontSize: '14px' }}>
                                <span style={{
                                    color: '#F0AB00',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    marginRight: '8px'
                                }}>+</span>
                                Create content templates with repository snapshots to control when patch updates are applied to your systems.
                            </p>
                            <p style={{ color: '#ffffff', margin: 0, fontSize: '14px' }}>
                                <span style={{
                                    color: '#F0AB00',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    marginRight: '8px'
                                }}>+</span>
                                Review and filter applicable advisories and affected systems before applying patches.
                            </p>
                            <p style={{ color: '#ffffff', margin: 0, fontSize: '14px' }}>
                                <span style={{
                                    color: '#F0AB00',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    marginRight: '8px'
                                }}>+</span>
                                Apply system patches using content templates to ensure consistent updates across your RHEL environment.
                            </p>
                        </div>
                    </FlexItem>

                    {/* Right side - Call to action card */}
                    <FlexItem flex={{ default: 'flex_1' }}>
                        <Card style={{ backgroundColor: '#ffffff', color: '#151515' }}>
                            <CardBody style={{ textAlign: 'center' }}>
                                <Title headingLevel="h2" size="lg" style={{ marginBottom: '12px', textAlign: 'center' }}>
                                    Start using Content management now
                                </Title>
                                <p style={{ color: '#6a6e73', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>
                                    Get started by creating a content template to manage system content and patch updates for your RHEL systems.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                                    <Button
                                        variant="primary"
                                        onClick={() => navigate('/templates')}
                                        style={{
                                            width: 'auto',
                                            minWidth: '200px'
                                        }}
                                    >
                                        Create template
                                    </Button>
                                    <Flex gap={{ default: 'gapMd' }} justifyContent={{ default: 'justifyContentCenter' }}>
                                        <Button
                                            variant="link"
                                            onClick={() => navigate('/repositories')}
                                        >
                                            Add repositories
                                        </Button>
                                        <Button
                                            variant="link"
                                            onClick={() => { }}
                                        >
                                            Take a tour
                                        </Button>
                                    </Flex>
                                </div>
                                <div style={{ textAlign: 'center', marginTop: '16px' }}>
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
                                        Learn about content management
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </FlexItem>
                </Flex>
            </div>

            {/* Light themed bottom section */}
            <Flex direction={{ default: 'row' }} gap={{ default: 'gapLg' }}>
                <FlexItem flex={{ default: 'flex_1' }}>
                    <div style={{
                        backgroundColor: '#f5f5f5',
                        padding: '32px',
                        borderRadius: '8px'
                    }}>
                        <Title headingLevel="h2" size="lg" style={{ marginBottom: '12px' }}>
                            About content templates
                        </Title>
                        <p style={{ color: '#6a6e73', marginBottom: '16px', fontSize: '14px' }}>
                            Content templates use repository snapshots to control which advisories and package versions are applied when patching your RHEL systems.
                        </p>
                        <p style={{ color: '#6a6e73', marginBottom: '24px', fontSize: '14px' }}>
                            Create content templates to review applicable advisories, filter affected systems, and apply consistent patch updates across your environment.
                        </p>
                        <div style={{ marginBottom: '24px' }}>
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
                                Learn more about architecture and RHEL version targeting
                            </Button>
                        </div>
                    </div>
                </FlexItem>
                <FlexItem flex={{ default: 'flex_1' }}>
                    <div style={{
                        backgroundColor: '#f5f5f5',
                        padding: '32px',
                        borderRadius: '8px'
                    }}>
                        <Title headingLevel="h2" size="lg" style={{ marginBottom: '12px' }}>
                            About repositories
                        </Title>
                        <p style={{ color: '#6a6e73', marginBottom: '16px', fontSize: '14px' }}>
                            Repositories provide the content sources that templates use to define what packages and errata are available to your systems.
                        </p>
                        <p style={{ color: '#6a6e73', marginBottom: '24px', fontSize: '14px' }}>
                            You can use Red Hat official repositories or add custom repositories to meet your specific needs.
                        </p>
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/repositories')}
                            style={{ marginBottom: '16px' }}
                        >
                            Browse Red Hat repositories
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
                    </div>
                </FlexItem>
            </Flex>
        </div>
    );
};

export { ZeroContent };
