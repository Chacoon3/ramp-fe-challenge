import { Fragment } from "react"

export function Instructions() {
  return (
    <Fragment>
      <h1 className="RampTextHeading--l">Approve transactions</h1>
      <div className="RampBreak--l" />
      <p className="RampText">
        <span className="RampBreak--s" />
        Select the checkbox on the right to approve or decline the transactions. You can filter
        transactions by employee.
      </p>
    </Fragment>
  )
}
