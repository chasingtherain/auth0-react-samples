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
    const [actionsList, setActionsList] = useState([])
    const [allClients, setAllClients] = useState([])

    const { apiOrigin = "http://localhost:3001" } = getConfig();

    // retrieve all clients in tenant and returns client names when called
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

    // retrieve all Actions in tenant and returns a list of deployed Actions when called
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

    // retrieve specific user's permission when called
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

    // checks access to report by passing user's permission to server for validation
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

        const retrieveReportApiTokenResponse = await axios(retrieveReportApiToken);

        const rawToken = JSON.parse(retrieveReportApiTokenResponse.data);
        const reportApiToken = rawToken.access_token

        const userPermission = await getUserPermission()

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

        if(response.data.status === 200){
            // if user has access, call relevant api and display table to user
            await getActionList()
            setIsManager(true)
        }
        
    }

    // Based on clients and actions in tenants, function returns an array of objects with: 
    // action names, trigger bounded to actions and which app uses which action

    const getActionList = async () => {
        const clientList = await getClients()
        const actions = await getActions()

        const combinedClientAndActionList = []

        // for each action, loop through app names and check if app utilised said action
        actions.forEach((action) => {
            const appList = []
            // if action.deployed_version.code is "", no code is provided and thus action is not used by any app
            if(action.deployed_version.code.length <= 0){
                combinedClientAndActionList.push({
                    name: action.name,
                    triggers: action.supported_triggers,
                    usedBy: [] // action not used by any app
                })
            }
            // if code subfield is not empty and event.client.name is not referenced in Action, 
            // then all apps are using it
            else if(!action.deployed_version.code.includes("event.client.name")){
                combinedClientAndActionList.push({
                    name: action.name,
                    triggers: action.supported_triggers,
                    usedBy: clientList // action used by all app
                })
            }
            // if code field is not empty and app name is found in code field,
            // that means conditional logic is applied to app and therefore, app is using action
            else{
                clientList.forEach((client) => {
                    if(action.deployed_version.code.includes(client)){
                        appList.push(client)
                    }
                })
                combinedClientAndActionList.push({
                    name: action.name,
                    triggers: action.supported_triggers,
                    usedBy: appList // action is used by some apps
                })
            } 
        })
        setActionsList(combinedClientAndActionList)
        setAllClients(clientList)
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                await checkAccessToActionReport()
                setIsFetching(false)
            } catch (error) {
                setIsFetching(false)
                console.log("useEffect error:", error)
            }
          };
      
          fetchData();

        // Optional cleanup function
        return () => {
        };
      }, []);

    if (error) {
        return <div>Oops... {error.message}</div>;
      }
    
    if (isLoading) {
        return <Loading />;
    }
    
    if(!user) history.push('/')
    
    // display Table UI if user is logged in and has manager role
    if(user && isManager){
        return (
            <Table actionsList={actionsList} allClients={allClients}/>
        )
    }

    return (
        // if app is no longer fetching and user is not a manager, access will be denied
        isFetching ? <div>loading...</div> :
        (user && !isManager) ? (<div> Access Denied </div>) : null
      );
}

export default ActionReportPage