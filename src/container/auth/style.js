import styled from 'styled-components';

import { InputWrapper } from '../../components/inputs/style';

const AuthWrapper = styled.div`
    &::before{
      content:'';
      background-color: ${({ theme }) => theme.colors.background};
      position:fixed;
      top:0;
      left:0;
      right:0;
      bottom:0;
      height:100%;
      width:100% ;
    }
  .auth-heading {
    margin-bottom: 45px;
    text-align: center;;
    h1 {
      font-weight: 700;
      font-size: ${({ theme }) => theme.colors.baseFontSizeLg};
      line-height: 42px;
      letter-spacing: 0.02em;
      margin-bottom: 12px;
      line-height: 30px;
      text-transform: capitalize;
      color: #272b41;
      padding-left: 2px;
    }
    p {
      font-weight: 400;
      font-size: ${({ theme }) => theme.colors.baseFontSize};
      line-height: 20px;
      letter-spacing: 0.01em;
      color: ${({ theme }) => theme.colors.bodyText};
      line-height: 16px;
      margin-bottom: 0;
      word-spacing: -1px;
      i {
        color: ${({ theme }) => theme.colors.secondaryColor};
      }
    }
  }
  .auth-content-bottom {
  }
  .auth-content {
    background: #ffffff;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    max-width: 422px;
    min-width:422px ;
    margin: 0 auto;
    width: 100%;
    padding:32px 30px 31px 30px;
    margin-top:136px;
    z-index:1;
    position:relative;

    button {
      margin-bottom: 0;
    }
    &.auth-terms {
      padding-left: 26px;
      padding-right: 26px;
      .auth-content-top {
        height: calc(100% - 240px);
      }
      .auth-content-bottom {
        bottom: 86px;
        padding-top: 20px;
      }
      p {
        font-weight: 300;
        font-size: ${({ theme }) => theme.colors.baseFontSize};
        line-height: 18px;
        letter-spacing: 0.02em;
        color: ${({ theme }) => theme.colors.bodyText};
        margin-bottom: 18px;
        &:last-of-type {
          margin-bottom: 0px;
        }
      }
      button {
        max-width: 368px;
        margin: 0 auto;
      }
    }
    /* Verification email screen */
    &.auth-centered-content,
    &.auth-topalign-content {
      .auth-content-top {
        height: calc(100% - 200px);
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 0;
        padding-top: 0;
        flex-direction: column;
      }
      .auth-content-bottom {
        bottom: 48px;
      }
      .email-verification-image {
        text-align: center;
        padding-top: 34px;
      }
      .password-verification-image {
        padding-top: 91px;
      }
      button {
        margin-bottom: 18px;
      }
    }
    &.auth-topalign-content {
      .auth-content-top {
        display: block;
        margin-top: 16px;
        padding-top: 16px;
      }
    }
    .forgot-password-link {
      a {
        color: ${({ theme }) => theme.colors.secondaryColor};
        font-weight: 700;
        font-size: ${({ theme }) => theme.colors.baseFontSize};
        line-height: 18px;
        letter-spacing: 0.02em;
      }
    }
    .secret-code {
      padding-top: 76px;
      .vi__wrapper {
        margin: 0 auto;
      }
      .vi__container {
        gap: 16px;
        height: 80px;
        width: 336px;
        margin: 0 auto;

        .vi__character {
          border: 1px solid #485666;
          border-radius: 7px;
          font-weight: 400;
          font-size: 40px;
          line-height: 48px;
          text-align: center;
          color: ${({ theme }) => theme.colors.bodyText};
          align-items: center;
          display: flex;
          justify-content: center;
          width: 72px;
          background: transparent;
          position: relative;
          outline: none;
          &.vi__character--selected {
            background: ${({ theme }) => theme.colors.background};
            border: 0px;
            &:before {
              content: "";
              background: linear-gradient(
                90deg,
                ${({ theme }) => theme.colors.primaryColor} 0%,
                ${({ theme }) => theme.colors.secondaryColor} 100%
              );
              background: linear-gradient(
                  105deg,
                  ${({ theme }) => theme.colors.primaryColor} 0%,
                  ${({ theme }) => theme.colors.secondaryColor} 100%
                )
                no-repeat padding-box;
              -webkit-mask: -webkit-linear-gradient(
                    345deg,
                    ${({ theme }) => theme.colors.primaryColor} 0%,
                    #7c0953 100%
                  )
                  content-box,
                -webkit-linear-gradient(345deg, #f55d0d 0%, #7c0953 100%);
              -webkit-mask-composite: xor;
              position: absolute;
              width: 100%;
              height: 100%;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              padding: 1px;
              border-radius: 8px;
            }
          }
        }
      }
    }
    .already-account {
      text-align: left;
      label {
        font-weight: 300;
        font-size: ${({ theme }) => theme.colors.baseFontSize};
        line-height: 20px;
        letter-spacing: 0.01em;
        color: ${({ theme }) => theme.colors.bodyText};
        a {
          color: ${({ theme }) => theme.colors.secondaryColor};
          text-decoration: none;
        }
      }
      &.email-receive {
        align-self: flex-start;
        margin-top: 32px;
      }
    }
  }
  .forget-password{
    display:flex;
    justify-content:center;
    margin-top:16px;
    a{
              color: ${({ theme }) => theme.colors.primaryColor};
               font-size: ${({ theme }) => theme.colors.baseFontSizeXs};
               font-weight:600;
                   &:hover{
                      color: ${({ theme }) => theme.colors.primaryColor}; 
                      text-decoration:none;
                      cursor: pointer;
                   }
    }
  }
  .remember-password{
    padding-right: 3px;
    a{
         color: ${({ theme }) => theme.colors.primaryColor};
               font-size: ${({ theme }) => theme.colors.baseFontSizeXs};
               padding-left:4px;
                    &:hover{
                      color: ${({ theme }) => theme.colors.primaryColor};
                      text-decoration:none;
                      cursor: pointer;
                   }
    }
  }
`;

export { AuthWrapper, InputWrapper };
