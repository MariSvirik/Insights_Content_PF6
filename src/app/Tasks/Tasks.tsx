import React from 'react';
import { Link } from 'react-router-dom';
import { PageSection, Title } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

const SAMPLE_TASK_ID = '9762543820108bvvy6';
const SAMPLE_TASK_NAME = 'Refresh Alternate Content Source refresh alternate content source';

export const Tasks: React.FunctionComponent = () => {
  return (
    <PageSection>
      <Title headingLevel="h1" size="2xl">
        Tasks
      </Title>
      <Table aria-label="Tasks table" className="pf-v6-u-mt-lg">
        <Thead>
          <Tr>
            <Th>Task</Th>
            <Th>State</Th>
            <Th>Started</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td dataLabel="Task">
              <Link to={`/task/${SAMPLE_TASK_ID}`}>{SAMPLE_TASK_NAME}</Link>
            </Td>
            <Td dataLabel="State">Failed</Td>
            <Td dataLabel="Started">09:15 UTC, 06 March 2023</Td>
            <Td dataLabel="Actions">
              <Link to={`/task/${SAMPLE_TASK_ID}`}>View</Link>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </PageSection>
  );
};
