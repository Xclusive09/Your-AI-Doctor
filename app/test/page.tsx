"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { testNetwork, testIntegration, showIntegrationChecklist } from '@/lib/test-integration'
import { BLOCKDAG_CONFIG } from '@/lib/blockdag'

export default function TestIntegrationPage() {
  const [isTestingNetwork, setIsTestingNetwork] = useState(false)
  const [isTestingIntegration, setIsTestingIntegration] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logId = Math.random().toString(36).substring(7)
    const formattedMessage = `[${timestamp}] [LOG-${logId}] ${message}`
    setLogs(prev => [...prev, formattedMessage])
  }

  const handleTestNetwork = async () => {
    const testSessionId = Math.random().toString(36).substring(7)
    setIsTestingNetwork(true)
    addLog(`🚀 NETWORK TEST SESSION STARTED [${testSessionId}]`)
    addLog(`Target RPC: ${BLOCKDAG_CONFIG.RPC_URL}`)
    addLog(`Expected Chain ID: ${BLOCKDAG_CONFIG.CHAIN_ID}`)
    
    // Override console.log to capture logs with enhanced formatting
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn
    
    let logCounter = 0
    
    console.log = (...args) => {
      logCounter++
      addLog(`📝 [${logCounter}] ${args.join(' ')}`)
      originalLog(...args)
    }
    console.error = (...args) => {
      logCounter++
      addLog(`💥 [${logCounter}] ERROR: ${args.join(' ')}`)
      originalError(...args)
    }
    console.warn = (...args) => {
      logCounter++
      addLog(`⚠️  [${logCounter}] WARN: ${args.join(' ')}`)
      originalWarn(...args)
    }
    
    const testStartTime = performance.now()
    
    try {
      addLog(`🔍 Executing testNetwork() function...`)
      const result = await testNetwork()
      const testDuration = performance.now() - testStartTime
      
      addLog(`${result ? '✅ NETWORK TEST PASSED' : '❌ NETWORK TEST FAILED'}`)
      addLog(`⏱️  Test Duration: ${testDuration.toFixed(2)}ms`)
      addLog(`📊 Console Messages Captured: ${logCounter}`)
      addLog(`🏁 NETWORK TEST SESSION COMPLETED [${testSessionId}]`)
      
    } catch (error) {
      const testDuration = performance.now() - testStartTime
      addLog(`💥 NETWORK TEST EXCEPTION: ${error}`)
      addLog(`⏱️  Test Duration: ${testDuration.toFixed(2)}ms`)
      addLog(`💀 NETWORK TEST SESSION FAILED [${testSessionId}]`)
    } finally {
      // Restore console methods
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
      setIsTestingNetwork(false)
    }
  }

  const handleTestIntegration = async () => {
    const integrationSessionId = Math.random().toString(36).substring(7)
    setIsTestingIntegration(true)
    addLog(`🔧 FULL INTEGRATION TEST SESSION STARTED [${integrationSessionId}]`)
    addLog(`Contract Address: ${BLOCKDAG_CONFIG.CONTRACT_ADDRESS}`)
    addLog(`Network: BlockDAG Testnet (Chain ID: ${BLOCKDAG_CONFIG.CHAIN_ID})`)
    
    // Override console methods to capture logs with enhanced formatting
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn
    
    let logCounter = 0
    
    console.log = (...args) => {
      logCounter++
      addLog(`📝 [${logCounter}] ${args.join(' ')}`)
      originalLog(...args)
    }
    console.error = (...args) => {
      logCounter++
      addLog(`💥 [${logCounter}] ERROR: ${args.join(' ')}`)
      originalError(...args)
    }
    console.warn = (...args) => {
      logCounter++
      addLog(`⚠️  [${logCounter}] WARN: ${args.join(' ')}`)
      originalWarn(...args)
    }
    
    const integrationStartTime = performance.now()
    
    try {
      addLog(`🎯 Executing testIntegration() function...`)
      addLog(`🔍 This will test: Network → Wallet → Balance → Smart Contract`)
      const result = await testIntegration()
      const integrationDuration = performance.now() - integrationStartTime
      
      addLog(`${result ? '✅ INTEGRATION TEST PASSED' : '❌ INTEGRATION TEST FAILED'}`)
      addLog(`⏱️  Test Duration: ${integrationDuration.toFixed(2)}ms`)
      addLog(`📊 Console Messages Captured: ${logCounter}`)
      addLog(`🏁 INTEGRATION TEST SESSION COMPLETED [${integrationSessionId}]`)
      
    } catch (error) {
      const integrationDuration = performance.now() - integrationStartTime
      addLog(`💥 INTEGRATION TEST EXCEPTION: ${error}`)
      addLog(`⏱️  Test Duration: ${integrationDuration.toFixed(2)}ms`)
      addLog(`💀 INTEGRATION TEST SESSION FAILED [${integrationSessionId}]`)
    } finally {
      // Restore console methods
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
      setIsTestingIntegration(false)
    }
  }

  const handleShowChecklist = () => {
    const checklistSessionId = Math.random().toString(36).substring(7)
    addLog(`📋 CHECKLIST DISPLAY SESSION [${checklistSessionId}]`)
    
    const originalLog = console.log
    const originalWarn = console.warn
    
    let logCounter = 0
    
    console.log = (...args) => {
      logCounter++
      addLog(`📝 [${logCounter}] ${args.join(' ')}`)
      originalLog(...args)
    }
    console.warn = (...args) => {
      logCounter++
      addLog(`⚠️  [${logCounter}] ${args.join(' ')}`)
      originalWarn(...args)
    }
    
    try {
      addLog(`🔍 Executing showIntegrationChecklist() function...`)
      showIntegrationChecklist()
      addLog(`📊 Checklist Messages Captured: ${logCounter}`)
      addLog(`✅ CHECKLIST DISPLAY COMPLETED [${checklistSessionId}]`)
    } catch (error) {
      addLog(`💥 CHECKLIST ERROR: ${error}`)
      addLog(`💀 CHECKLIST DISPLAY FAILED [${checklistSessionId}]`)
    } finally {
      console.log = originalLog
      console.warn = originalWarn
    }
  }

  const clearLogs = () => setLogs([])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            BlockDAG Integration Testing
          </h1>
          <p className="text-gray-400 text-lg">
            Test your deployed HealthPassport smart contract integration
          </p>
        </div>

        {/* Configuration Display */}
        <Card className="mb-8 backdrop-blur-sm bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Current Configuration</CardTitle>
            <CardDescription>
              Environment variables and deployment details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Contract Address:</p>
                <p className="text-white font-mono text-xs break-all">{BLOCKDAG_CONFIG.CONTRACT_ADDRESS}</p>
              </div>
              <div>
                <p className="text-gray-400">RPC URL:</p>
                <p className="text-white font-mono text-xs">{BLOCKDAG_CONFIG.RPC_URL}</p>
              </div>
              <div>
                <p className="text-gray-400">Chain ID:</p>
                <p className="text-white font-mono">{BLOCKDAG_CONFIG.CHAIN_ID}</p>
              </div>
              <div>
                <p className="text-gray-400">Explorer:</p>
                <p className="text-white font-mono text-xs">{BLOCKDAG_CONFIG.EXPLORER_URL}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Buttons */}
        <Card className="mb-8 backdrop-blur-sm bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Integration Tests</CardTitle>
            <CardDescription>
              Run these tests to verify your BlockDAG integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={handleShowChecklist}
                variant="outline"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                📋 Show Checklist
              </Button>
              
              <Button 
                onClick={handleTestNetwork}
                disabled={isTestingNetwork}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isTestingNetwork ? '⏳ Testing...' : '🌐 Test Network'}
              </Button>
              
              <Button 
                onClick={handleTestIntegration}
                disabled={isTestingIntegration}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isTestingIntegration ? '⏳ Testing...' : '🧪 Test Integration'}
              </Button>
              
              <Button 
                onClick={clearLogs}
                variant="outline"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                🗑️ Clear Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card className="backdrop-blur-sm bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Test Results</CardTitle>
            <CardDescription>
              Real-time logs from integration tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900/50 rounded-lg p-4 h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 italic">No test results yet. Run a test to see output here.</p>
              ) : (
                logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`text-sm mb-1 ${
                      log.includes('ERROR') ? 'text-red-400' : 
                      log.includes('WARN') ? 'text-yellow-400' :
                      log.includes('✅') ? 'text-green-400' :
                      log.includes('❌') ? 'text-red-400' :
                      'text-gray-300'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
