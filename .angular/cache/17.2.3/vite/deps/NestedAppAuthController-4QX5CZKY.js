import {
  BridgeStatusCode
} from "./chunk-SFVKSKUF.js";
import {
  AuthError,
  AuthToken_exports,
  AuthenticationScheme,
  ClientAuthError,
  ClientAuthErrorCodes_exports,
  CryptoOps,
  DEFAULT_CRYPTO_IMPLEMENTATION,
  EventHandler,
  EventType,
  InteractionRequiredAuthError,
  InteractionType,
  PerformanceEvents,
  RequestParameterBuilder,
  ServerError,
  StringUtils,
  TimeUtils_exports,
  createClientAuthError
} from "./chunk-XU4WRQPX.js";
import {
  __async
} from "./chunk-47AXDMZD.js";

// node_modules/@azure/msal-browser/dist/naa/BridgeError.mjs
function isBridgeError(error) {
  return error.status !== void 0;
}

// node_modules/@azure/msal-browser/dist/naa/mapping/NestedAppAuthAdapter.mjs
var NestedAppAuthAdapter = class {
  constructor(clientId, clientCapabilities, crypto, logger) {
    this.clientId = clientId;
    this.clientCapabilities = clientCapabilities;
    this.crypto = crypto;
    this.logger = logger;
  }
  toNaaTokenRequest(request) {
    let extraParams;
    if (request.extraQueryParameters === void 0) {
      extraParams = /* @__PURE__ */ new Map();
    } else {
      extraParams = new Map(Object.entries(request.extraQueryParameters));
    }
    const requestBuilder = new RequestParameterBuilder();
    const claims = requestBuilder.addClientCapabilitiesToClaims(request.claims, this.clientCapabilities);
    const tokenRequest = {
      platformBrokerId: request.account?.homeAccountId,
      clientId: this.clientId,
      authority: request.authority,
      scope: request.scopes.join(" "),
      correlationId: request.correlationId !== void 0 ? request.correlationId : this.crypto.createNewGuid(),
      claims: !StringUtils.isEmptyObj(claims) ? claims : void 0,
      state: request.state,
      authenticationScheme: request.authenticationScheme || AuthenticationScheme.BEARER,
      extraParameters: extraParams
    };
    return tokenRequest;
  }
  fromNaaTokenResponse(request, response, reqTimestamp) {
    if (!response.token.id_token || !response.token.access_token) {
      throw createClientAuthError(ClientAuthErrorCodes_exports.nullOrEmptyToken);
    }
    const expiresOn = new Date((reqTimestamp + (response.token.expires_in || 0)) * 1e3);
    const idTokenClaims = AuthToken_exports.extractTokenClaims(response.token.id_token, this.crypto.base64Decode);
    const account = this.fromNaaAccountInfo(response.account, idTokenClaims);
    const scopes = response.token.scope || request.scope;
    const authenticationResult = {
      authority: response.token.authority || account.environment,
      uniqueId: account.localAccountId,
      tenantId: account.tenantId,
      scopes: scopes.split(" "),
      account,
      idToken: response.token.id_token,
      idTokenClaims,
      accessToken: response.token.access_token,
      fromCache: true,
      expiresOn,
      tokenType: request.authenticationScheme || AuthenticationScheme.BEARER,
      correlationId: request.correlationId,
      extExpiresOn: expiresOn,
      state: request.state
    };
    return authenticationResult;
  }
  /*
   *  export type AccountInfo = {
   *     homeAccountId: string;
   *     environment: string;
   *     tenantId: string;
   *     username: string;
   *     localAccountId: string;
   *     name?: string;
   *     idToken?: string;
   *     idTokenClaims?: TokenClaims & {
   *         [key: string]:
   *             | string
   *             | number
   *             | string[]
   *             | object
   *             | undefined
   *             | unknown;
   *     };
   *     nativeAccountId?: string;
   *     authorityType?: string;
   * };
   */
  fromNaaAccountInfo(fromAccount, idTokenClaims) {
    const effectiveIdTokenClaims = idTokenClaims || fromAccount.idTokenClaims;
    const localAccountId = fromAccount.localAccountId || effectiveIdTokenClaims?.oid || effectiveIdTokenClaims?.sub || "";
    const tenantId = fromAccount.tenantId || effectiveIdTokenClaims?.tid || "";
    const homeAccountId = fromAccount.homeAccountId || `${localAccountId}.${tenantId}`;
    const username = fromAccount.username || effectiveIdTokenClaims?.preferred_username || "";
    const name = fromAccount.name || effectiveIdTokenClaims?.name;
    const account = {
      homeAccountId,
      environment: fromAccount.environment,
      tenantId,
      username,
      localAccountId,
      name,
      idToken: fromAccount.idToken,
      idTokenClaims: effectiveIdTokenClaims
    };
    return account;
  }
  /**
   *
   * @param error BridgeError
   * @returns AuthError, ClientAuthError, ClientConfigurationError, ServerError, InteractionRequiredError
   */
  fromBridgeError(error) {
    if (isBridgeError(error)) {
      switch (error.status) {
        case BridgeStatusCode.UserCancel:
          return new ClientAuthError(ClientAuthErrorCodes_exports.userCanceled);
        case BridgeStatusCode.NoNetwork:
          return new ClientAuthError(ClientAuthErrorCodes_exports.noNetworkConnectivity);
        case BridgeStatusCode.AccountUnavailable:
          return new ClientAuthError(ClientAuthErrorCodes_exports.noAccountFound);
        case BridgeStatusCode.Disabled:
          return new ClientAuthError(ClientAuthErrorCodes_exports.nestedAppAuthBridgeDisabled);
        case BridgeStatusCode.NestedAppAuthUnavailable:
          return new ClientAuthError(error.code || ClientAuthErrorCodes_exports.nestedAppAuthBridgeDisabled, error.description);
        case BridgeStatusCode.TransientError:
        case BridgeStatusCode.PersistentError:
          return new ServerError(error.code, error.description);
        case BridgeStatusCode.UserInteractionRequired:
          return new InteractionRequiredAuthError(error.code, error.description);
        default:
          return new AuthError(error.code, error.description);
      }
    } else {
      return new AuthError("unknown_error", "An unknown error occurred");
    }
  }
};

// node_modules/@azure/msal-browser/dist/error/NestedAppAuthError.mjs
var NestedAppAuthErrorMessage = {
  unsupportedMethod: {
    code: "unsupported_method",
    desc: "The PKCE code challenge and verifier could not be generated."
  }
};
var NestedAppAuthError = class _NestedAppAuthError extends AuthError {
  constructor(errorCode, errorMessage) {
    super(errorCode, errorMessage);
    Object.setPrototypeOf(this, _NestedAppAuthError.prototype);
    this.name = "NestedAppAuthError";
  }
  static createUnsupportedError() {
    return new _NestedAppAuthError(NestedAppAuthErrorMessage.unsupportedMethod.code, NestedAppAuthErrorMessage.unsupportedMethod.desc);
  }
};

// node_modules/@azure/msal-browser/dist/controllers/NestedAppAuthController.mjs
var NestedAppAuthController = class _NestedAppAuthController {
  constructor(operatingContext) {
    this.operatingContext = operatingContext;
    const proxy = this.operatingContext.getBridgeProxy();
    if (proxy !== void 0) {
      this.bridgeProxy = proxy;
    } else {
      throw new Error("unexpected: bridgeProxy is undefined");
    }
    this.config = operatingContext.getConfig();
    this.logger = this.operatingContext.getLogger();
    this.performanceClient = this.config.telemetry.client;
    this.browserCrypto = operatingContext.isBrowserEnvironment() ? new CryptoOps(this.logger, this.performanceClient) : DEFAULT_CRYPTO_IMPLEMENTATION;
    this.eventHandler = new EventHandler(this.logger, this.browserCrypto);
    this.nestedAppAuthAdapter = new NestedAppAuthAdapter(this.config.auth.clientId, this.config.auth.clientCapabilities, this.browserCrypto, this.logger);
  }
  getBrowserStorage() {
    throw NestedAppAuthError.createUnsupportedError();
  }
  getEventHandler() {
    return this.eventHandler;
  }
  static createController(operatingContext) {
    return __async(this, null, function* () {
      const controller = new _NestedAppAuthController(operatingContext);
      return Promise.resolve(controller);
    });
  }
  initialize() {
    return Promise.resolve();
  }
  acquireTokenInteractive(request) {
    return __async(this, null, function* () {
      this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_START, InteractionType.Popup, request);
      const atPopupMeasurement = this.performanceClient.startMeasurement(PerformanceEvents.AcquireTokenPopup, request.correlationId);
      atPopupMeasurement?.add({ nestedAppAuthRequest: true });
      try {
        const naaRequest = this.nestedAppAuthAdapter.toNaaTokenRequest(request);
        const reqTimestamp = TimeUtils_exports.nowSeconds();
        const response = yield this.bridgeProxy.getTokenInteractive(naaRequest);
        const result = this.nestedAppAuthAdapter.fromNaaTokenResponse(naaRequest, response, reqTimestamp);
        this.operatingContext.setActiveAccount(result.account);
        this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_SUCCESS, InteractionType.Popup, result);
        atPopupMeasurement.add({
          accessTokenSize: result.accessToken.length,
          idTokenSize: result.idToken.length
        });
        atPopupMeasurement.end({
          success: true,
          requestId: result.requestId
        });
        return result;
      } catch (e) {
        const error = this.nestedAppAuthAdapter.fromBridgeError(e);
        this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_FAILURE, InteractionType.Popup, null, e);
        atPopupMeasurement.end({
          errorCode: error.errorCode,
          subErrorCode: error.subError,
          success: false
        });
        throw error;
      }
    });
  }
  acquireTokenSilentInternal(request) {
    return __async(this, null, function* () {
      this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_START, InteractionType.Silent, request);
      const ssoSilentMeasurement = this.performanceClient.startMeasurement(PerformanceEvents.SsoSilent, request.correlationId);
      ssoSilentMeasurement?.increment({
        visibilityChangeCount: 0
      });
      ssoSilentMeasurement?.add({
        nestedAppAuthRequest: true
      });
      try {
        const naaRequest = this.nestedAppAuthAdapter.toNaaTokenRequest(request);
        const reqTimestamp = TimeUtils_exports.nowSeconds();
        const response = yield this.bridgeProxy.getTokenSilent(naaRequest);
        const result = this.nestedAppAuthAdapter.fromNaaTokenResponse(naaRequest, response, reqTimestamp);
        this.operatingContext.setActiveAccount(result.account);
        this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_SUCCESS, InteractionType.Silent, result);
        ssoSilentMeasurement?.add({
          accessTokenSize: result.accessToken.length,
          idTokenSize: result.idToken.length
        });
        ssoSilentMeasurement?.end({
          success: true,
          requestId: result.requestId
        });
        return result;
      } catch (e) {
        const error = this.nestedAppAuthAdapter.fromBridgeError(e);
        this.eventHandler.emitEvent(EventType.ACQUIRE_TOKEN_FAILURE, InteractionType.Silent, null, e);
        ssoSilentMeasurement?.end({
          errorCode: error.errorCode,
          subErrorCode: error.subError,
          success: false
        });
        throw error;
      }
    });
  }
  acquireTokenPopup(request) {
    return __async(this, null, function* () {
      return this.acquireTokenInteractive(request);
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  acquireTokenRedirect(request) {
    throw NestedAppAuthError.createUnsupportedError();
  }
  acquireTokenSilent(silentRequest) {
    return __async(this, null, function* () {
      return this.acquireTokenSilentInternal(silentRequest);
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  acquireTokenByCode(request) {
    throw NestedAppAuthError.createUnsupportedError();
  }
  acquireTokenNative(request, apiId, accountId) {
    throw NestedAppAuthError.createUnsupportedError();
  }
  acquireTokenByRefreshToken(commonRequest, silentRequest) {
    throw NestedAppAuthError.createUnsupportedError();
  }
  /**
   * Adds event callbacks to array
   * @param callback
   */
  addEventCallback(callback) {
    return this.eventHandler.addEventCallback(callback);
  }
  /**
   * Removes callback with provided id from callback array
   * @param callbackId
   */
  removeEventCallback(callbackId) {
    this.eventHandler.removeEventCallback(callbackId);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addPerformanceCallback(callback) {
    throw NestedAppAuthError.createUnsupportedError();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removePerformanceCallback(callbackId) {
    throw NestedAppAuthError.createUnsupportedError();
  }
  enableAccountStorageEvents() {
    throw NestedAppAuthError.createUnsupportedError();
  }
  disableAccountStorageEvents() {
    throw NestedAppAuthError.createUnsupportedError();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAccount(accountFilter) {
    throw NestedAppAuthError.createUnsupportedError();
  }
  getAccountByHomeId(homeAccountId) {
    const currentAccount = this.operatingContext.getActiveAccount();
    if (currentAccount !== void 0) {
      if (currentAccount.homeAccountId === homeAccountId) {
        return this.nestedAppAuthAdapter.fromNaaAccountInfo(currentAccount);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  getAccountByLocalId(localId) {
    const currentAccount = this.operatingContext.getActiveAccount();
    if (currentAccount !== void 0) {
      if (currentAccount.localAccountId === localId) {
        return this.nestedAppAuthAdapter.fromNaaAccountInfo(currentAccount);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  getAccountByUsername(userName) {
    const currentAccount = this.operatingContext.getActiveAccount();
    if (currentAccount !== void 0) {
      if (currentAccount.username === userName) {
        return this.nestedAppAuthAdapter.fromNaaAccountInfo(currentAccount);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  getAllAccounts() {
    const currentAccount = this.operatingContext.getActiveAccount();
    if (currentAccount !== void 0) {
      return [
        this.nestedAppAuthAdapter.fromNaaAccountInfo(currentAccount)
      ];
    } else {
      return [];
    }
  }
  handleRedirectPromise(hash) {
    throw NestedAppAuthError.createUnsupportedError();
  }
  loginPopup(request) {
    if (request !== void 0) {
      return this.acquireTokenInteractive(request);
    } else {
      throw NestedAppAuthError.createUnsupportedError();
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loginRedirect(request) {
    throw NestedAppAuthError.createUnsupportedError();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  logout(logoutRequest) {
    throw NestedAppAuthError.createUnsupportedError();
  }
  logoutRedirect(logoutRequest) {
    throw NestedAppAuthError.createUnsupportedError();
  }
  logoutPopup(logoutRequest) {
    throw NestedAppAuthError.createUnsupportedError();
  }
  ssoSilent(request) {
    return this.acquireTokenSilentInternal(request);
  }
  getTokenCache() {
    throw NestedAppAuthError.createUnsupportedError();
  }
  /**
   * Returns the logger instance
   */
  getLogger() {
    return this.logger;
  }
  /**
   * Replaces the default logger set in configurations with new Logger with new configurations
   * @param logger Logger instance
   */
  setLogger(logger) {
    this.logger = logger;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setActiveAccount(account) {
    this.logger.warning("nestedAppAuth does not support setActiveAccount");
    return;
  }
  getActiveAccount() {
    const currentAccount = this.operatingContext.getActiveAccount();
    if (currentAccount !== void 0) {
      return this.nestedAppAuthAdapter.fromNaaAccountInfo(currentAccount);
    } else {
      return null;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initializeWrapperLibrary(sku, version) {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setNavigationClient(navigationClient) {
    this.logger.warning("setNavigationClient is not supported in nested app auth");
  }
  getConfiguration() {
    return this.config;
  }
  isBrowserEnv() {
    return this.operatingContext.isBrowserEnvironment();
  }
  getBrowserCrypto() {
    return this.browserCrypto;
  }
  getPerformanceClient() {
    throw NestedAppAuthError.createUnsupportedError();
  }
  getRedirectResponse() {
    throw NestedAppAuthError.createUnsupportedError();
  }
  preflightBrowserEnvironmentCheck(interactionType, setInteractionInProgress) {
    throw NestedAppAuthError.createUnsupportedError();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  clearCache(logoutRequest) {
    return __async(this, null, function* () {
      throw NestedAppAuthError.createUnsupportedError();
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hydrateCache(result, request) {
    return __async(this, null, function* () {
      throw NestedAppAuthError.createUnsupportedError();
    });
  }
};
export {
  NestedAppAuthController
};
/*! Bundled license information:

@azure/msal-browser/dist/naa/BridgeError.mjs:
  (*! @azure/msal-browser v3.10.0 2024-02-17 *)

@azure/msal-browser/dist/naa/mapping/NestedAppAuthAdapter.mjs:
  (*! @azure/msal-browser v3.10.0 2024-02-17 *)

@azure/msal-browser/dist/error/NestedAppAuthError.mjs:
  (*! @azure/msal-browser v3.10.0 2024-02-17 *)

@azure/msal-browser/dist/controllers/NestedAppAuthController.mjs:
  (*! @azure/msal-browser v3.10.0 2024-02-17 *)
*/
//# sourceMappingURL=NestedAppAuthController-4QX5CZKY.js.map
