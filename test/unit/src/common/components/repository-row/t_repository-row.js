import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';

import { RepositoryRowView } from '../../../../../../src/common/components/repository-row';
import { Row } from '../../../../../../src/common/components/vanilla/table-interactive';
import {
  NameMismatchDropdown,
  RemoveRepoDropdown,
  UnconfiguredDropdown,
  RegisterNameDropdown
} from '../../../../../../src/common/components/repository-row/dropdowns';

describe('<RepositoryRowView />', () => {
  const props = {
    snap: {
      gitBranch: 'master',
      gitRepoUrl: 'https://github.com/anowner/aname',
      storeName: 'test-snap',
      snapcraftData: { name: 'test-snap' }
    },
    latestBuild: {
      buildId:  '1234',
      buildLogUrl: 'http://example.com/12344567890_BUILDING.txt.gz',
      architecture: 'arch',
      colour: 'green',
      statusMessage: 'Build test status',
      dateStarted: '2017-03-07T12:29:45.297305+00:00',
      duration: '0:01:24.425045'
    },
    fullName: 'anowner/aname',
    nameOwnership: {},
    checkNameOwnership: () => {},
    authStore: {
      authenticated: true,
      userName: 'store-user'
    },
    registerNameStatus: {
      success: true
    }
  };

  let view;

  context('dropdowns', function() {

    beforeEach(function() {
      view = shallow(<RepositoryRowView { ...props }/>);
    });

    context('configureIsOpen prop is true', function() {
      it('should render unconfigured dropdown', function() {
        view.setProps({ configureIsOpen: true, snap: { snapcraftData: null } });
        expect(view.find(UnconfiguredDropdown).length).toBe(1);
      });
    });

    context('registerNameIsOpen prop is true', function() {
      it('should render dropdown', function() {
        view.setProps({ registerNameIsOpen: true });
        expect(view.find(RegisterNameDropdown).length).toBe(1);
      });
    });

    context('toggleDropdownState', function() {
      let component;

      beforeEach(function() {
        view = shallow(<RepositoryRowView { ...props }/>);
        component = view.instance();
      });

      it('should render NameMismatchDropdown', function() {
        component.toggleDropdownState('nameMismatchDropdownExpanded');
        expect(view.find(NameMismatchDropdown).length).toBe(1);
      });

      it('should render UnconfiguredDropdown', function() {
        component.toggleDropdownState('unconfiguredDropdownExpanded');
        view.setProps({ snap: { snapcraftData: null } });
        expect(view.find(UnconfiguredDropdown).length).toBe(1);
      });

      it('should render UnregisteredDropdown', function() {
        component.toggleDropdownState('unregisteredDropdownExpanded');
        expect(view.find(RegisterNameDropdown).length).toBe(1);
      });

      it('should render RemoveRepoDropdown', function() {
        component.toggleDropdownState('removeDropdownExpanded');
        expect(view.find(RemoveRepoDropdown).length).toBe(1);
      });
    });
  });

  context('when latest build log is available', () => {
    beforeEach(() => {
      // shallow render container component and get view from it
      view = shallow(<RepositoryRowView { ...props }/>);
    });

    it('should render Row', () => {
      expect(view.type()).toEqual(Row);
    });

    it('should contain build status column linked to repo page', () => {
      const expectedUrl = `/user/${props.fullName}`;

      // find a BuildStatus component and check `to` prop on parent (DataLink)
      expect(view.find('BuildStatus').parent().length).toBe(1);
      expect(view.find('BuildStatus').parent().prop('to')).toBe(expectedUrl);
    });
  });

  context('when latest build log is not yet available', () => {
    let buildLogUrl;

    before(function() {
      buildLogUrl = props.latestBuild.buildLogUrl;
    });

    beforeEach(() => {
      props.latestBuild.buildLogUrl = null;
      view = shallow(<RepositoryRowView { ...props }/>);
    });

    after(function() {
      props.latestBuild.buildLogUrl = buildLogUrl;
    });

    it('should contain BuildStatus linked to repo page', () => {
      const expectedUrl = `/user/${props.fullName}`;

      // find a BuildStatus component and check `to` prop on parent (DataLink)
      expect(view.find('BuildStatus').parent().length).toBe(1);
      expect(view.find('BuildStatus').parent().prop('to')).toBe(expectedUrl);
    });
  });

  context('when snapcraft data with name is available', () => {
    it('should set default snap name based on name from snapcraft.yaml', () => {
      expect(view.instance().state.snapName).toEqual(props.snap.snapcraftData.name);
    });
  });

  context('when snapcraft data is not available', () => {
    beforeEach(() => {
      const noNameProps = {
        ...props,
        snap: {
          gitRepoUrl: 'http://github.com/anowner/_some-Crazy_123Name_'
        }
      };

      view = shallow(<RepositoryRowView { ...noNameProps }/>);
    });

    it('should set default snap name based on repo name', () => {
      // valid name should be lowercased with unvalid chars replaced with dashes
      expect(view.instance().state.snapName).toEqual('some-crazy-123name');
    });
  });

});
