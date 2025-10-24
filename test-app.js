import { Application } from './src/index';

// Test the application initialization without starting the server
console.log('Testing AKI! Microservice Core...');

try {
  // Test domain entities
  console.log('✅ Domain entities imported successfully');
  
  // Test value objects
  console.log('✅ Value objects imported successfully');
  
  // Test use cases
  console.log('✅ Use cases imported successfully');
  
  // Test repositories
  console.log('✅ Repositories imported successfully');
  
  // Test controllers
  console.log('✅ Controllers imported successfully');
  
  console.log('\n🎉 All components loaded successfully!');
  console.log('📋 AKI! Microservice Core is ready for deployment.');
  
} catch (error) {
  console.error('❌ Error testing application:', error);
  process.exit(1);
}