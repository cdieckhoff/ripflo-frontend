const hostIP = `192.168.68.55:1105`;
const http = `http://`;
const ws = `ws://`;
const rfHost = `${http}${hostIP}`;
const rfwsHost = `${ws}${hostIP}/ws`
const gws = new WebSocket(rfwsHost);

async function rpHealth(){
    let resp = await fetch(`${rfHost}/health`);
    if(resp.ok){
        const t = await resp.json();
        //console.log(t);
    }else{
        //console.log(`Error: response not ok`)
    }
}
// /src/lib/utils.js
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function calculateDuration(beginDate, endDate) {
    // Calculate business days between dates
    // Implementation depends on your needs
    return '3 days';
}