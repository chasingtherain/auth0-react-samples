import { useAuth0 } from '@auth0/auth0-react'
import { useHistory } from "react-router-dom";
import React, { Fragment, useEffect, useState } from 'react'
import Loading from '../components/Loading';
import { getConfig } from '../config';
import axios from 'axios';
import Table from '../components/Table';

function ActionReportPage() {
    const { error, user, isLoading, getAccessTokenSilently } = useAuth0()
    const history = useHistory();
    const [isManager, setIsManager] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    
    // console.log("user: ", user)
    // const [deployedActions, setDeployedActions] = useState([])
    const [actionsList, setActionsList] = useState([])
    const [allClients, setAllClients] = useState([])

    const { apiOrigin = "http://localhost:3001", audience } = getConfig();

    const getClients = async () => {
        try {
            // get token
            console.log("getClients called");
            const token = await getAccessTokenSilently();
            
            let config = {
              method: 'get',
              url: `${apiOrigin}/api/v2/clients`,
              headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            };
        
            const response = await axios(config);
            // filter out "All Applications" name from client list
            const clientNames = response.data.result.filter(client => client.name !== "All Applications").map((client) => client.name);

            return clientNames;
          } catch (error) {
            console.log(error);
            return null;
          }
      };

    const getActions = async () => {
        try {
          console.log("getActions called");
      
          const token = await getAccessTokenSilently();
      
          let config = {
            method: 'get',
            url: `${apiOrigin}/api/v2/actions/actions`,
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          };
      
          const response = await axios(config);
          return response.data.result.actions
        } catch (error) {
          console.log(error);
        }
    };
      
    const getUserPermission = async () => {
        try {
            const token = await getAccessTokenSilently();

            let config = {
              method: 'post',
              // `${apiOrigin}/api/v2/users/${user.sub}/permissions` returns 404
              url: `${apiOrigin}/api/user/permission`,
              headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              data: [user.sub]
            };
            
            const response = await axios(config);

            return response.data

        } catch (error) {
            console.log(error);
            return null;
          }
    };
    const checkAccessToActionReport = async () => {

        const token = await getAccessTokenSilently();
 
        let retrieveReportApiToken = {
            method: 'get',
            url: `${apiOrigin}/get-report-api-token`,
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          };
        // console.log("original token", token)
        const retrieveReportApiTokenResponse = await axios(retrieveReportApiToken);

        const rawToken = JSON.parse(retrieveReportApiTokenResponse.data);
        const reportApiToken = rawToken.access_token

        const userPermission = await getUserPermission()
        console.log("userPermission: ", userPermission)
        let config = {
          method: 'post',
          url: `http://localhost:8080/authorized`,
          headers: { 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${reportApiToken}`
          },
          data: userPermission
        };
    
        const response = await axios(config);
        console.log("own API resp: ", response.data);

        if(response.data.status === 200){
            // if user has access, call relevant api and display table to user
            await getActionList()
            setIsManager(true)
        }
        
    }


    const getActionList = async () => {
        const clientList = await getClients()
        const actions = await getActions()

        const combinedClientAndActionList = []

        // for each action, loop through all app and check if action applies to app
        // 
        actions.forEach((action) => {
            const appList = []
            // if action.deployed_version.code is "", no code is provided and thus action is not used by any app
            if(action.deployed_version.code.length <= 0){
                // console.log("action is not used by any app")
                combinedClientAndActionList.push({
                    name: action.name,
                    triggers: action.supported_triggers,
                    usedBy: []
                })
            }
            // if event.client.name is not referenced in Action, all apps are using it
            else if(!action.deployed_version.code.includes("event.client.name")){
                combinedClientAndActionList.push({
                    name: action.name,
                    triggers: action.supported_triggers,
                    usedBy: clientList
                })
            }
            // if code field has app name and conditional logic is applied to app and therefore, app is using action
            else{
                clientList.forEach((client) => {
                    if(action.deployed_version.code.includes(client)){
                        appList.push(client)
                        // console.log("client name", client)
                    }
                })
                combinedClientAndActionList.push({
                    name: action.name,
                    triggers: action.supported_triggers,
                    usedBy: appList
                })
            } 
        })
        // console.log("combinedClientAndActionList: ", combinedClientAndActionList)

        setActionsList(combinedClientAndActionList)
        setAllClients(clientList)
    }

    useEffect(() => {
        // Call your functions here
        const fetchData = async () => {
            try {
              // Call your async functions in sequence
                // await getUserPermission()
                await checkAccessToActionReport()
                setIsFetching(false)
                // await getClients()
            } catch (error) {
              // Handle any errors
                setIsFetching(false)
                console.log("useEffect error:", error)
            }
          };
      
          fetchData();

        // Optional cleanup function
        return () => {
          // Perform cleanup tasks here (if needed)
        };
      }, []);

    if (error) {
        return <div>Oops... {error.message}</div>;
      }
    
    if (isLoading) {
        return <Loading />;
    }
    
    if(!user) history.push('/')
    

    if(user && isManager){
    // if(user && !isManager){
        return (
            <Table actionsList={actionsList} allClients={allClients}/>
        )
    }
    console.log("isFetching: ", isFetching)
    return (
        isFetching ? <div>loading...</div> :
        (user && !isManager) ? (
          <div>
            Access Denied
          </div>
        ) : null
      );
}

export default ActionReportPage