import React from 'react'

function Table({actionsList, allClients}) {
// console.log("actionsList from table: ", actionsList)
// console.log("allClients from table: ", allClients)

const actionsUsedByApp = allClients
                            ?.map(client => actionsList
                            ?.filter(action => action.usedBy.includes(client)))

// console.log("actionsUsedByApp: ", actionsUsedByApp)
  return (
        <div className="overflow-x-auto">
        <table className="table mb-5">
            {/* head */}
            <thead>
            <tr className='text-black'>
                <th></th>
                <th>Action</th>
                <th>Bounds with</th>
                <th>Used by</th>
            </tr>
            </thead>
            <tbody>
            {actionsList.length == 0 && <p>loading...</p>}
            {
                actionsList?.map((action, index) => (
                    <tr className='hover:bg-slate-50'>
                        <th>{index + 1}</th>
                        <td>{action?.name}</td>
                        <td>{action.triggers.map(trigger => trigger.id).join(', ')}</td>
                        <td>{action.usedBy.join(', ') || "NA"}</td>
                    </tr>
                ))
            }
            </tbody>
        </table>

        <table className="table">
            {/* head */}
            <thead>
            <tr className='text-black'>
                <th></th>
                <th>Application</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {allClients.length == 0 && <p>loading...</p>}
            {
                allClients?.map((client, index) => (
                    <tr className='hover:bg-slate-50'>
                        <th>{index + 1}</th>
                        <td>{client}</td>
                        <td>{actionsUsedByApp[index].map(action => action.name).join(', ')}</td>
                    </tr>
                ))
            }
            </tbody>
        </table>
        </div>
  )
}

export default Table