import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { A11yIssue } from './types';

export type A11ySeverity = 'Serious' | 'Critical';

type RuleHelp = {
  [key: string]: {
    url: string;
    issue: string;
    severity: A11ySeverity;
    message: string;
    expectation: string;
  };
};

const SEVERITIES: { [key in A11ySeverity]: string } | null = __DEV__
  ? {
      Serious: 'Serious',
      Critical: 'Critical',
    }
  : null;

const RULES_HELP: RuleHelp | null = __DEV__
  ? {
      CONTRAST_FAILED: {
        url: '/guidelines/contrast',
        issue: 'Contrast failed',
        severity: 'Serious',
        message: 'Text contrast does not meet accessibility requirements.',
        expectation: 'Ensure text has sufficient contrast against its background.',
      },
      CONTRAST_FAILED_AAA: {
        url: '/guidelines/contrast',
        issue: 'Contrast failed AAA',
        severity: 'Serious',
        message: 'Text contrast does not meet AAA accessibility requirements.',
        expectation: 'Ensure text has sufficient contrast for AAA compliance.',
      },
      MINIMUM_SIZE: {
        url: '/guidelines/minimum-size',
        issue: 'Minimum size not met',
        severity: 'Serious',
        message: 'Interactive elements must meet minimum size requirements.',
        expectation: 'Ensure interactive elements are at least 44x44 points.',
      },
      UPPERCASE_TEXT_NO_ACCESSIBILITY_LABEL: {
        url: '/guidelines/text',
        issue: 'Uppercase text without accessibility label',
        severity: 'Serious',
        message: 'Uppercase text may be read letter-by-letter by screen readers.',
        expectation: 'Provide an accessibility label with properly formatted text.',
      },
      NO_UPPERCASE_TEXT: {
        url: '/guidelines/text',
        issue: 'Uppercase text detected',
        severity: 'Serious',
        message: 'Uppercase text may be difficult to read and understand.',
        expectation: 'Use sentence case instead of all uppercase text.',
      },
      NO_ACCESSIBILITY_LABEL: {
        url: '/guidelines/accessibility-label',
        issue: 'Missing accessibility label',
        severity: 'Critical',
        message:
          "Screen readers rely on accessibility labels to announce the purpose of elements. Without labels, visually impaired users can't understand the functionality.",
        expectation:
          'Add a descriptive aria-label prop clearly explaining the element\'s action (e.g., "Add to cart", "Go back").',
      },
      NO_ACCESSIBILITY_ROLE: {
        url: '/guidelines/accessibility-role',
        severity: 'Critical',
        issue: 'Missing accessibility role',
        message:
          'Accessibility roles help users understand how to interact with an element, indicating what action can be performed and what outcome to expect.',
        expectation:
          'Specify an appropriate aria-role prop (e.g., "button", "link") for the component.',
      },
      NO_KEYBOARD_TRAP: {
        url: '/guidelines/forms',
        issue: 'Keyboard trap detected',
        severity: 'Critical',
        message: 'Users must be able to navigate away from elements using keyboard.',
        expectation: 'Ensure all interactive elements can be navigated away from using keyboard.',
      },
      NO_FORM_LABEL: {
        url: '/guidelines/forms',
        issue: 'Form missing label',
        severity: 'Critical',
        message: 'Form inputs must have associated labels for accessibility.',
        expectation: 'Add appropriate labels to all form inputs.',
      },
      NO_FORM_ERROR: {
        url: '/guidelines/forms',
        issue: 'Form missing error handling',
        severity: 'Serious',
        message: 'Form errors must be properly communicated to users.',
        expectation: 'Implement proper error messaging and validation feedback.',
      },
      FLATLIST_NO_COUNT_IN_SINGULAR_MESSAGE: {
        url: '/guidelines/lists-grids#number-of-results',
        issue: 'FlatList missing count in singular message',
        severity: 'Serious',
        message: 'List count information helps users understand the content scope.',
        expectation: 'Include item count in singular accessibility messages.',
      },
      FLATLIST_NO_COUNT_IN_PLURAL_MESSAGE: {
        url: '/guidelines/lists-grids#number-of-results',
        issue: 'FlatList missing count in plural message',
        severity: 'Serious',
        message: 'List count information helps users understand the content scope.',
        expectation: 'Include item count in plural accessibility messages.',
      },
      BOTTOM_SHEET_CLOSE_ACTION: {
        url: '/guidelines/bottomsheet',
        issue: 'Bottom sheet missing close action',
        severity: 'Critical',
        message: 'Bottom sheets must provide accessible ways to close them.',
        expectation: 'Add accessible close button or gesture handling.',
      },
      INCOMPATIBLE_ACCESSIBILITY_STATE: {
        url: '/guidelines/accessibility-role',
        issue: 'Incompatible accessibility state',
        severity: 'Serious',
        message: 'Accessibility state conflicts with the element role.',
        expectation: 'Ensure accessibility state is compatible with the element role.',
      },
      INCOMPATIBLE_ACCESSIBILITY_ROLE: {
        url: '/guidelines/accessibility-role',
        issue: 'Incompatible accessibility role',
        severity: 'Serious',
        message: 'The accessibility role does not match the element purpose.',
        expectation: 'Use an appropriate accessibility role for the element.',
      },
      NO_FORM_LABEL_ENDING_WITH_ASTERISK: {
        url: '/guidelines/forms#labels',
        issue: 'Form label ending with asterisk',
        severity: 'Serious',
        message: 'Asterisks in labels may not be announced by screen readers.',
        expectation: 'Use explicit required field indicators instead of asterisks.',
      },
    }
  : null;

export const GetRuleError = __DEV__
  ? ({ issue }: { issue: A11yIssue }) => {
      const ruleHelp = RULES_HELP![issue.rule];

      return (
        <>
          <View style={styles!.row}>
            <Text style={styles!.bold} aria-role="header">
              Issue:
            </Text>
            <Text>{ruleHelp.issue}</Text>
          </View>
          <View style={styles!.row}>
            <Text style={styles!.bold} aria-role="header">
              Severity:
            </Text>
            <Text>{SEVERITIES![ruleHelp.severity]}</Text>
          </View>
          <Text style={[styles!.bold, styles?.full]} aria-role="header">
            Why this matters:
          </Text>
          <View style={styles!.row}>
            <Text style={styles?.text}>{ruleHelp.message}</Text>
          </View>
          <Text style={[styles!.bold, styles?.full]} aria-role="header">
            How to fix:
          </Text>
          <View style={styles!.row}>
            <Text style={styles?.text}>{ruleHelp.expectation}</Text>
          </View>
        </>
      );
    }
  : null;

export const getRuleErrorInfo = __DEV__
  ? (issue: A11yIssue) => {
      const ruleHelp = RULES_HELP![issue.rule];

      let message = ruleHelp.message;

      if (issue.reason) {
        message += ': ' + issue.reason;
      }

      const url = `https://nearform.com/open-source/react-native-ama/${ruleHelp.url}`;

      return { message, url, severity: ruleHelp.severity };
    }
  : null;

const styles = __DEV__
  ? StyleSheet.create({
      row: {
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        width: '100%',
        marginBottom: 12,
      },
      bold: {
        fontSize: 14,
        fontWeight: 600,
        paddingRight: 12,
      },
      full: {
        width: '100%',
        marginBottom: 4,
      },
      text: {
        lineHeight: 18,
      },
    })
  : null;
