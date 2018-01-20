module.exports = {
    reqResNext: () => {
        let sentStatus, tmpStatus = 200, nextCalled = 0, sentJson
    
        const reqMock = { 
            header: (key) => reqMock.headers[key],
            headers: []
        }
    
        const resMock = {
            status: (statusCode) => {
                tmpStatus = statusCode
                return resMock
            },
            json: (resBody) => {
                sentJson = resBody
                sentStatus = tmpStatus
                return resMock
            }
        }
    
        const next = () => nextCalled++
        
        return {
            req: reqMock,
            res: resMock,
            next: next,
            getSentStatus: () => sentStatus,
            getNextCount: () => nextCalled,
            getSentBody: () => sentJson
        }
    }
}