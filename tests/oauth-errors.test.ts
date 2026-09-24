import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  classifyOAuthError,
  failureTag,
} from "../lib/auth/oauth-errors.ts";

/**
 * The strings below are the ones GoTrue and Entra really send. The point of
 * this file is that a sign-in failure gets a message someone can act on —
 * "ask the lead to enable your account" instead of "please try again", which
 * is advice to keep doing the thing that cannot work.
 */

describe("signups disabled", () => {
  test("a project that refuses new accounts is named as such", () => {
    for (const description of [
      "Signups not allowed for this instance",
      "Signups not allowed for otp",
      "signup_disabled",
    ]) {
      assert.equal(
        classifyOAuthError({ error: "server_error", description }),
        "newuser",
        description,
      );
    }
  });

  test("the error code alone is enough", () => {
    assert.equal(
      classifyOAuthError({ error: "access_denied", errorCode: "signup_disabled" }),
      "newuser",
    );
  });
});

describe("an email that already belongs to an account", () => {
  test("the identity cannot be joined to it", () => {
    for (const description of [
      "Unverified email with azure. A user already exists with this email address.",
      "A user with this email address has already been registered",
      "identity_already_exists",
      "email_exists",
    ]) {
      assert.equal(
        classifyOAuthError({ error: "server_error", description }),
        "conflict",
        description,
      );
    }
  });
});

describe("an identity with no email", () => {
  test("is reported as such rather than as a domain refusal", () => {
    for (const description of [
      "Error getting user email from external provider",
      "Email not provided by the provider",
    ]) {
      assert.equal(
        classifyOAuthError({ error: "server_error", description }),
        "noemail",
        description,
      );
    }
  });
});

describe("the person backed out", () => {
  test("is not presented as a fault", () => {
    assert.equal(
      classifyOAuthError({
        error: "access_denied",
        description: "The user has denied access to the scope requested",
      }),
      "cancelled",
    );
    assert.equal(
      classifyOAuthError({
        error: "access_denied",
        description: "AADSTS65004: User declined to consent",
      }),
      "cancelled",
    );
  });
});

describe("the provider leg", () => {
  test("a rejected client secret reads as a provider problem", () => {
    for (const description of [
      "Unable to exchange external code: invalid_client",
      "AADSTS7000215: Invalid client secret provided.",
      "invalid_client",
    ]) {
      assert.equal(
        classifyOAuthError({ error: "server_error", description }),
        "provider",
        description,
      );
    }
  });

  test("a disabled provider is not a mystery", () => {
    assert.equal(
      classifyOAuthError({
        error: "validation_failed",
        description: "Unsupported provider: provider is not enabled",
      }),
      "provider",
    );
  });

  test("a bare server_error still beats 'try again'", () => {
    /*
     * It carries nothing on its own, but in practice it is the provider leg,
     * and the log line alongside it has the detail.
     */
    assert.equal(classifyOAuthError({ error: "server_error" }), "provider");
  });
});

describe("when there is nothing to go on", () => {
  test("an empty report stays generic", () => {
    assert.equal(classifyOAuthError({}), "failed");
    assert.equal(
      classifyOAuthError({ error: null, errorCode: null, description: null }),
      "failed",
    );
  });

  test("an unrecognised error stays generic rather than guessing", () => {
    assert.equal(
      classifyOAuthError({ error: "teapot", description: "something new" }),
      "failed",
    );
  });
});

describe("the reference tag", () => {
  test("prefers the specific code", () => {
    assert.equal(
      failureTag({ error: "server_error", errorCode: "signup_disabled" }),
      "signup_disabled",
    );
  });

  test("falls back to the error, then to none", () => {
    assert.equal(failureTag({ error: "access_denied" }), "access_denied");
    assert.equal(failureTag({}), "none");
  });

  test("cannot carry anything but a short slug onto the screen", () => {
    // It is rendered on a login page that may be shared or screenshotted.
    const tag = failureTag({
      error: "<script>alert(1)</script> mike@webwizards.ca",
    });
    assert.match(tag, /^[a-z0-9_]{1,24}$/);
    assert.ok(!tag.includes("@"));
    assert.ok(!tag.includes("<"));
  });
});
