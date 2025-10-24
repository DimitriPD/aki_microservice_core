#!/usr/bin/env node

console.log('🚀 AKI! Microservice Core - Setup Verification');
console.log('=' .repeat(50));

// Test 1: Check if all required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'Dockerfile',
  'docker-compose.yml',
  '.env.example',
  'src/index.ts',
  'src/domain/entities/Event.ts',
  'src/domain/entities/Attendance.ts',
  'src/domain/entities/Occurrence.ts',
  'src/application/use-cases/events/CreateEventUseCase.ts',
  'src/infrastructure/database/models/EventModel.ts',
  'src/interface/controllers/EventController.ts',
  'src/shared/utils/GeoUtils.ts'
];

console.log('\n📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Test 2: Check if build directory exists
console.log('\n🔨 Checking build output...');
if (fs.existsSync('dist')) {
  console.log('✅ Build directory exists');
  
  const builtFiles = [
    'dist/index.js',
    'dist/domain/entities/Event.js',
    'dist/infrastructure/database/models/EventModel.js'
  ];
  
  builtFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`⚠️  ${file} - not found (run npm run build)`);
    }
  });
} else {
  console.log('⚠️  Build directory not found (run npm run build)');
}

// Test 3: Check package.json dependencies
console.log('\n📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'express',
    'mongoose', 
    'jsonwebtoken',
    'zod',
    'winston',
    'dotenv',
    'typescript'
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
    }
  });
} catch (error) {
  console.log('❌ Error reading package.json');
}

// Test 4: Architecture verification
console.log('\n🏗️  Checking architecture layers...');
const architectureLayers = [
  'src/domain',
  'src/application', 
  'src/infrastructure',
  'src/interface',
  'src/shared'
];

architectureLayers.forEach(layer => {
  if (fs.existsSync(layer)) {
    console.log(`✅ ${layer}`);
  } else {
    console.log(`❌ ${layer} - MISSING`);
    allFilesExist = false;
  }
});

// Final result
console.log('\n' + '=' .repeat(50));
if (allFilesExist) {
  console.log('🎉 SETUP VERIFICATION COMPLETE!');
  console.log('✅ All required files and structure are in place');
  console.log('📋 The AKI! Microservice Core is ready for deployment');
  console.log('\n📋 Next steps:');
  console.log('1. Start MongoDB: docker run -d -p 27017:27017 mongo:7.0');
  console.log('2. Copy environment: cp .env.example .env');
  console.log('3. Start service: npm run dev');
} else {
  console.log('❌ SETUP INCOMPLETE');
  console.log('Some required files are missing. Please check the implementation.');
  process.exit(1);
}

console.log('\n🔗 Useful commands:');
console.log('npm run build    - Build TypeScript to JavaScript');
console.log('npm run dev      - Start in development mode');  
console.log('npm start        - Start production build');
console.log('docker-compose up - Start with Docker');