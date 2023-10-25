import React, { useState, useEffect } from 'react';
import { isEmpty } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import Tabs from '../../../components/tabs/index';
// component
import AddItem from './component/addItem';
import PoQueue from './component/poQueue';
import AllPO from './component/allPo';

import {
  SetPoQueueItemState

} from '../../../redux/slices/purchasing';

const Index = () => {
  const dispatch = useDispatch();

  const {
    purchasingTab
  } = useSelector((state) => state.poQueueItem);

  const {
    selectedSupplierPO
  } = useSelector((state) => state.purchaseOrder);


  const [tabs] = useState([
    {
      title: 'Add  item to Queue',
      component: <AddItem />
    },
    {
      title: 'PO Queue',
      component: <PoQueue createPO={() => dispatch(SetPoQueueItemState({
        field: 'purchasingTab', value: 1
      }))}
      />
    },
    {
      title: 'All PO',
      component: <AllPO />
    }
  ]);
  const handleTabValue = (newValue) => {
    dispatch(SetPoQueueItemState({
      field: 'purchasingTab', value: newValue
    }));
  };

  useEffect(() => {
    if (!isEmpty(selectedSupplierPO)) {
      dispatch(SetPoQueueItemState({
        field: 'purchasingTab', value: 2
      }));
    }
  }, [selectedSupplierPO]);

  return (
    <Tabs
      center
      tabs={tabs}
      value={purchasingTab}
      onTabChange={(newValue) => handleTabValue(newValue)}
      className="purchasing-tabs order-custom-tabs"
    />
  );
};

export default Index;
