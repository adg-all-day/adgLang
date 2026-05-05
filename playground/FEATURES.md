# adgLang Playground - Enhanced Features

## Recent Enhancements

### 📊 Real-time Statistics Dashboard

- **Server Status**: Live health monitoring with online/offline indicators
- **Compilation Metrics**: Tracks total compilations and success rates
- **Performance Tracking**: Monitors average compilation time
- **Auto-refresh**: Statistics refresh every 5 seconds

### 📝 Comprehensive Logging System

- **Multi-level Logging**: info, warn, error, and debug levels
- **Timestamped Entries**: Precise tracking for all server activity
- **Request Tracking**: Unique IDs for tracing compilation requests
- **Log Retention**: Keeps the last 1000 log entries
- **Colored Console Output**: Makes log levels easier to distinguish visually

### ⏱ Performance Monitoring

- **Execution Timing**: Tracks compilation and execution duration
- **Output Metrics**: Monitors output size and performance
- **Phase Breakdown**: Separate timing for lexing, parsing, compilation, and execution
- **Success Rate Tracking**: Live compilation success/failure stats

### 🔌 Extended API Endpoints

#### `/health` - Server Health Check

```bash
curl http://localhost:3001/health
```

Returns server uptime and status.

#### `/stats` - Detailed Statistics

```bash
curl http://localhost:3001/stats
```

Returns full server metrics:

- Total requests processed
- Successful vs failed compilations
- Average compilation time
- Success rate percentage
- Server uptime

#### `/logs` - Access Server Logs

```bash
curl http://localhost:3001/logs?limit=50
```

Returns recent server logs with a configurable limit.

#### `/logs/clear` - Clear Log History

```bash
curl -X POST http://localhost:3001/logs/clear
```

Clears all accumulated logs.

### 🎨 UI Improvements

- **Execution Info Panel**: Shows timing and output size after execution
- **Live Stats Sidebar**: Displays live server stats in the sidebar
- **Enhanced Status Indicators**: Gives visual feedback for server connectivity
- **Better Error Display**: Improves error formatting and context

### 🔍 Debug Capabilities

- **Request Tracing**: Each compilation gets a unique request ID
- **Detailed Error Logging**: Preserves stack traces and error context
- **Performance Profiling**: Breaks down compiler pipeline stages
- **Memory Tracking**: Logs temp file management and cleanup

## Usage Examples

### Monitoring Server Performance

```javascript
// Fetch current statistics
const response = await fetch("http://localhost:3001/stats");
const stats = await response.json();

console.log(`Success Rate: ${stats.successRate}`);
console.log(`Avg Compile Time: ${stats.averageCompileTime}ms`);
```

### Accessing Logs

```javascript
// Get last 100 log entries
const response = await fetch("http://localhost:3001/logs?limit=100");
const { logs } = await response.json();

logs.forEach((log) => {
  console.log(`[${log.level}] ${log.timestamp}: ${log.message}`);
});
```

### Health Monitoring

```javascript
// Check if server is responsive
const response = await fetch("http://localhost:3001/health");
const health = await response.json();

if (health.status === "ok") {
  console.log(`Server running for ${health.uptime} seconds`);
}
```

## Configuration

### Logging Configuration

```typescript
// Adjust log retention in server.ts
private maxLogs = 1000; // Keep last 1000 logs

// Change periodic stats logging interval
setInterval(() => {
  logger.info("Periodic stats update", {...});
}, 300000); // Every 5 minutes
```

### Performance Tuning

```typescript
// Execution timeout (in compileAndRun function)
timeout: 5000, // 5 second timeout

// Output buffer limit
maxBuffer: 1024 * 1024, // 1MB buffer
```

### Stats Update Frequency

```javascript
// Frontend polling interval (in app.js)
setInterval(pollServerStats, 5000); // Update every 5 seconds
```

## Monitoring Best Practices

1. **Regular Health Checks**: Use the `/health` endpoint to monitor uptime
2. **Log Review**: Check `/logs` from time to time for errors and warnings
3. **Performance Analysis**: Watch `/stats` for compile-time trends
4. **Clear Logs**: Use `/logs/clear` when log volume gets too high
5. **Error Tracking**: Look for failed compilation patterns in the stats

## Future Enhancements

- [ ] WebSocket support for real-time log streaming
- [ ] Persistent statistics storage
- [ ] User session tracking
- [ ] Code sharing via URLs
- [ ] Syntax error highlighting in editor
- [ ] Autocomplete for adgLang keywords
- [ ] Multi-file project support
- [ ] Export compiled binaries
- [ ] Performance graphs and charts
- [ ] Code snippet library
