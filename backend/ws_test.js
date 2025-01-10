// websocketTest.js
import { WebSocket } from 'ws';

class WebSocketTest {
    constructor(url = 'ws://localhost:3000') {
        this.url = url;
        this.ws = null;
        this.testResults = [];
    }

    async runTests() {
        console.log('Starting WebSocket Tests...\n');
        
        // Connect to WebSocket
        await this.connect();
        
        // Run test sequence
        await this.testConnectionStatus();
        await this.testDataReading();
        await this.testTagWriting();
        await this.testErrorHandling();
        
        // Print test results
        this.printResults();
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                console.log('✓ Connected to WebSocket server');
                resolve();
            };

            this.ws.onerror = (error) => {
                console.error('× Connection failed:', error);
                reject(error);
            };

            // Set up message handler
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('Received:', JSON.stringify(data, null, 2));
                this.handleMessage(data);
            };
        });
    }

    async testConnectionStatus() {
        console.log('\nTesting Connection Status...');
        this.addResult('Connection', this.ws.readyState === WebSocket.OPEN);
    }

    async testDataReading() {
        console.log('\nTesting PLC Data Reading...');
        
        // Request tag reads
        const readTests = [
            { tag: 'Quantity' },
            { tag: 'CompleteReq' }
        ];

        for (const test of readTests) {
            console.log(`Reading tag: ${test.tag}`);
            await this.sendMessage({
                type: 'read',
                tag: test.tag
            });
            // Wait for response
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    async testTagWriting() {
        console.log('\nTesting PLC Tag Writing...');
        
        // Test writing different data types
        const writeTests = [
            { tag: 'UserName', value: 'TestUser' },
            { tag: 'MONumber', value: 'MO12345' },
            { tag: 'StepNumber', value: 1 }
        ];

        for (const test of writeTests) {
            console.log(`Writing ${test.value} to ${test.tag}`);
            await this.sendMessage({
                type: 'write',
                tag: test.tag,
                value: test.value
            });
            // Wait for response
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    async testErrorHandling() {
        console.log('\nTesting Error Handling...');
        
        // Test invalid tag
        await this.sendMessage({
            type: 'read',
            tag: 'NonExistentTag'
        });

        // Test invalid message type
        await this.sendMessage({
            type: 'invalidType'
        });

        // Wait for error responses
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    async sendMessage(message) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not open');
        }
    }

    handleMessage(data) {
        switch (data.type) {
            case 'plcData':
                this.addResult('PLC Data Format', 
                    data.data.hasOwnProperty('Quantity') && 
                    data.data.hasOwnProperty('CompleteReq')
                );
                break;
            case 'error':
                this.addResult('Error Handling', true);
                break;
            case 'writeResponse':
                this.addResult(`Write ${data.tag}`, data.success);
                break;
        }
    }

    addResult(testName, passed) {
        this.testResults.push({ testName, passed });
    }

    printResults() {
        console.log('\nTest Results:');
        console.log('=============');
        this.testResults.forEach(result => {
            console.log(
                `${result.passed ? '✓' : '×'} ${result.testName}: ${result.passed ? 'PASSED' : 'FAILED'}`
            );
        });
    }

    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Run the tests
const tester = new WebSocketTest();
tester.runTests()
    .catch(console.error)
    .finally(() => {
        // Close connection after 5 seconds to allow for all responses
        setTimeout(() => {
            tester.close();
            process.exit(0);
        }, 5000);
    });