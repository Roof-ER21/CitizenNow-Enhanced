#!/usr/bin/env node
/**
 * Environment Variable Validator
 * Run before deployment to ensure all required variables are set
 * Usage: node env-validator.js [production|staging|development]
 */

const fs = require('fs');
const path = require('path');

const ENV = process.argv[2] || 'development';
const ENV_FILE = ENV === 'production' ? '.env.production' :
                 ENV === 'staging' ? '.env.staging' : '.env';

console.log(`\n🔍 Validating environment: ${ENV}`);
console.log(`📄 Reading file: ${ENV_FILE}\n`);

// Required variables for all environments
const REQUIRED_VARS = [
  'EXPO_PUBLIC_ENV',
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

// At least one AI service is required
const AI_SERVICE_VARS = [
  'EXPO_PUBLIC_OPENAI_API_KEY',
  'EXPO_PUBLIC_GEMINI_API_KEY',
];

// Recommended but optional
const RECOMMENDED_VARS = [
  'EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID',
  'EXPO_PUBLIC_ELEVENLABS_API_KEY',
];

// Production-only requirements
const PRODUCTION_REQUIRED = [
  'EXPO_PUBLIC_SUPPORT_EMAIL',
];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ERROR: ${filePath} not found!`);
    process.exit(1);
  }

  const envContent = fs.readFileSync(filePath, 'utf-8');
  const env = {};

  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key) {
        env[key.trim()] = value;
      }
    }
  });

  return env;
}

function validateEnv(env, envName) {
  const errors = [];
  const warnings = [];
  let validCount = 0;

  console.log('━'.repeat(60));
  console.log('REQUIRED VARIABLES');
  console.log('━'.repeat(60));

  // Check required variables
  REQUIRED_VARS.forEach(varName => {
    const value = env[varName];
    if (!value || value === '' || value.includes('your-') || value.includes('your_')) {
      console.log(`❌ ${varName}: NOT SET`);
      errors.push(`Missing required variable: ${varName}`);
    } else {
      console.log(`✅ ${varName}: SET`);
      validCount++;
    }
  });

  // Check AI service (at least one required)
  console.log('\n' + '━'.repeat(60));
  console.log('AI SERVICE CONFIGURATION (At least one required)');
  console.log('━'.repeat(60));

  const hasAIService = AI_SERVICE_VARS.some(varName => {
    const value = env[varName];
    const isSet = value && value !== '' && !value.includes('your-') && !value.includes('your_');
    console.log(`${isSet ? '✅' : '⚠️ '} ${varName}: ${isSet ? 'SET' : 'NOT SET'}`);
    if (isSet) validCount++;
    return isSet;
  });

  if (!hasAIService) {
    errors.push('At least one AI service API key required (OpenAI or Gemini)');
  }

  // Check production-specific requirements
  if (envName === 'production') {
    console.log('\n' + '━'.repeat(60));
    console.log('PRODUCTION-SPECIFIC REQUIREMENTS');
    console.log('━'.repeat(60));

    PRODUCTION_REQUIRED.forEach(varName => {
      const value = env[varName];
      if (!value || value === '' || value.includes('your-') || value.includes('example')) {
        console.log(`❌ ${varName}: NOT SET`);
        errors.push(`Missing production variable: ${varName}`);
      } else {
        console.log(`✅ ${varName}: SET`);
        validCount++;
      }
    });
  }

  // Check recommended variables
  console.log('\n' + '━'.repeat(60));
  console.log('RECOMMENDED VARIABLES');
  console.log('━'.repeat(60));

  RECOMMENDED_VARS.forEach(varName => {
    const value = env[varName];
    if (!value || value === '' || value.includes('your-')) {
      console.log(`⚠️  ${varName}: NOT SET (Optional but recommended)`);
      warnings.push(`Recommended variable not set: ${varName}`);
    } else {
      console.log(`✅ ${varName}: SET`);
      validCount++;
    }
  });

  // Security checks
  console.log('\n' + '━'.repeat(60));
  console.log('SECURITY VALIDATION');
  console.log('━'.repeat(60));

  // Check for placeholder values
  const placeholderPatterns = [
    'your-',
    'your_',
    'example',
    'test-key',
    'placeholder',
    '123456',
    'abcdef'
  ];

  Object.entries(env).forEach(([key, value]) => {
    if (key.includes('API_KEY') || key.includes('SECRET')) {
      placeholderPatterns.forEach(pattern => {
        if (value.toLowerCase().includes(pattern)) {
          console.log(`⚠️  ${key} appears to contain placeholder value`);
          warnings.push(`${key} may have placeholder value`);
        }
      });

      // Check key length (most API keys are at least 20 chars)
      if (value.length < 20 && value !== '') {
        console.log(`⚠️  ${key} seems too short (${value.length} chars)`);
        warnings.push(`${key} might be invalid (too short)`);
      }
    }
  });

  // Firebase project ID validation
  if (env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) {
    const projectId = env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
    if (!/^[a-z0-9-]+$/.test(projectId)) {
      console.log(`⚠️  Firebase Project ID format looks incorrect`);
      warnings.push('Firebase Project ID should be lowercase with hyphens');
    } else {
      console.log(`✅ Firebase Project ID format valid`);
    }
  }

  // Environment consistency check
  const declaredEnv = env.EXPO_PUBLIC_ENV;
  if (declaredEnv !== envName && envName !== 'development') {
    console.log(`⚠️  EXPO_PUBLIC_ENV is "${declaredEnv}" but validating for "${envName}"`);
    warnings.push(`Environment mismatch: Expected ${envName}, got ${declaredEnv}`);
  } else if (declaredEnv === envName) {
    console.log(`✅ Environment declaration matches: ${envName}`);
  }

  // Results
  console.log('\n' + '━'.repeat(60));
  console.log('VALIDATION RESULTS');
  console.log('━'.repeat(60));
  console.log(`✅ Valid variables: ${validCount}`);
  console.log(`❌ Errors: ${errors.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));
  }

  console.log('\n' + '━'.repeat(60));

  if (errors.length > 0) {
    console.log('\n❌ VALIDATION FAILED - Please fix errors before deploying\n');
    process.exit(1);
  } else if (warnings.length > 0 && envName === 'production') {
    console.log('\n⚠️  WARNINGS FOUND - Review before production deployment\n');
    process.exit(0); // Allow but warn
  } else {
    console.log('\n✅ VALIDATION PASSED - Environment is ready!\n');
    process.exit(0);
  }
}

// Run validation
const env = parseEnvFile(path.join(__dirname, ENV_FILE));
validateEnv(env, ENV);
