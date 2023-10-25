import Styled from 'styled-components';

const TableWrapper = Styled.div`
    height: ${(props) => `calc(100vh - ${props.height || ''})`};
    max-height: ${(props) => props.maxheight || ''};
    min-height: ${(props) => props.minheight || ''};
    /* min-width: 768px; */
    overflow:auto ;
    &.supplier-details-table{
        min-height:331px;
    }
    &.order-workflow-table{
        min-height:270px;
    }
    &.file-upload-table{
        position:relative;
        z-index:0;
        .MuiTable-root{
            min-width:150px;
        }
        .filename-ellipses{
            max-width:100px;
        }
    }
    .MuiTableHead-root {
        background-color:${({ theme }) => theme.colors.background};
        .MuiTableRow-root  {
            .MuiTableCell-root {
                padding:9px 12px;
                color:${({ theme }) => theme.colors.labelColor};
                font-size:${({ theme }) => theme.colors.baseFontSizeXs};
                font-weight:400;
                line-height:${({ theme }) => theme.colors.baseFontSizeXs};
                background-color:${({ theme }) => theme.colors.background};
                white-space:pre;
                     &:first-child{ 
                    position:${(props) => (props.fixed ? 'sticky' : '')};
                    left:${(props) => (props.fixed ? '0' : '')};
                    background-color:${(props) => (props.fixed ? '#F8F8F8' : '')};
                    z-index:9;
               
                 }
                  &:last-child{
                    position:${(props) => (props.fixed ? 'sticky' : '')};
                    right:${(props) => (props.fixed ? '0' : '')};
                    width:${(props) => (props.fixed ? '100px' : '')};
            }
            }
            .MuiTableSortLabel-root{
                .sorting-icons{
                    margin-left:8px;
                   .sort-ascending,.sort-descending{
                    color:${({ theme }) => theme.colors.labelColor};
                   }
                }
                &.sort-descending{
                    .sorting-icons{
                        .sort-descending{
                            color:${({ theme }) => theme.colors.primaryColor};
                        }
                    }
                }
                &.sort-ascending{
                    .sorting-icons{
                        .sort-ascending{
                            color:${({ theme }) => theme.colors.primaryColor};
                        }
                    }
                }
            }
        }
    }
    .MuiTableBody-root {
        .MuiTableRow-root {
               vertical-align:${(props) => (props.alignCenter ? 'middle' : 'top')};
            &.selected{
                   background-color:${({ theme }) => theme.colors.primaryColor}05;
                    .MuiTableCell-root{
                        border-bottom:1px solid ${({ theme }) => theme.colors.primaryColor}
            }
            }
            .MuiTableCell-root{
                font-size:${({ theme }) => theme.colors.baseFontSize};
                color:${({ theme }) => theme.colors.tableBody};
                padding:${(props) => (props.bodyPadding ? `${props.bodyPadding}` : '12px 12px')};
                white-space:pre;
                line-height: 16px;
              &:first-child{
                    position:${(props) => (props.fixed ? 'sticky' : '')};
                    left:${(props) => (props.fixed ? '0' : '')};
                    background-color:${(props) => (props.fixed ? '#fff' : '')};
                           z-index:1;
            }

                &:last-child{
                    position:${(props) => (props.fixed ? 'sticky' : '')};
                    right:${(props) => (props.fixed ? '0' : '')};
                    width:${(props) => (props.fixed ? '100px' : '')};
                    background-color:${(props) => (props.fixed ? '#fff' : '')};
            }
                &:last-child th{
                border-bottom:1px solid #ccc;
            }
                 &:last-child td{
                border-bottom:1px solid #ccc;
            }


            }
        &.MuiTableRow-hover
        {
            &:hover{
                background-color:#F8F8F8;
            .MuiTableCell-root{
                &:first-child{
                    background-color:#F8F8F8;
                }
                &:last-child{
                    background-color:#F8F8F8;
                }
            }
        }
        }

    }
    
}
    &.packing-slip-table{
        table{
            border-spacing:0 8px;
        }
        .MuiTableCell-root{
            &:last-of-type{
                text-align:right;
            }
        }
        .MuiTableHead-root .MuiTableRow-root .MuiTableCell-root{
            background-color: #b4b4b4;
            color: #000000;
            font-weight:700;
            border:1px solid #000;
            border-right:0;
            &:last-of-type{
                border-right:1px solid;
            }
        }
        .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root{
            border-color:#000000;
            border:1px solid;
            border-right:0px;
            padding:8px;
            &:last-of-type{
                border-right:1px solid;
            }
        }
        .nested-row{
            & > td{
                border-bottom:0;
                padding-top:0!important;
                padding-bottom:0px!important;
                border:0px!important;
            }
            &.nested-row-first{
                & > td{
                    padding-top:6px!important;
                }
            }
        }
        .nested-table{
            table{
                border-spacing:0!important;
            }
            .MuiTable-root {
                .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root{
                    border-bottom:0px;
                    padding: 2px 5px;
                    border-right:0px;
                    border:0;
                    &:last-of-type{
                        text-align:left;
                        border-right:0;
                    }
                }
                .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root:last-child td{
                    border-bottom:0;
                    border-right:0;
                }
            }
        }
    }
    &.packing-slip-header-table{
        .MuiTable-root{
            min-width:300px;
        }
        .MuiTableHead-root .MuiTableRow-root .MuiTableCell-root{
            background-color: #b4b4b4;
            color: #000000;
            font-weight:700;
            border:1px solid #000;
            border-right:0;
            border-bottom:0;
            &:last-of-type{
                border-right:1px solid;
            }
        }
        .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root{
            border:1px solid #000;
            border-right:0;
            &:last-of-type{
                border-right:1px solid;
            }
        }
    }
`;
export default TableWrapper;
