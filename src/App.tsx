import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(false)
  const [isTransactionLoading, setIsTransactionLoading] = useState(false)
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>(EMPTY_EMPLOYEE.id)

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )


  const loadAllTransactions = useCallback(async () => {
    setIsEmployeeLoading(true)
    setIsTransactionLoading(true)
    transactionsByEmployeeUtils.invalidateData()

    await employeeUtils.fetchAll()
    setIsEmployeeLoading(false)
    await paginatedTransactionsUtils.fetchAll()
    setIsTransactionLoading(false)

  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()
      transactionsByEmployeeUtils.invalidateData()

      if (employeeId === EMPTY_EMPLOYEE.id) {
        await paginatedTransactionsUtils.fetchAll()
      }
      else {
        await transactionsByEmployeeUtils.fetchById(employeeId)
      }
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isEmployeeLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }
            if (newValue === EMPTY_EMPLOYEE) {
              await loadAllTransactions()
            }
            await loadTransactionsByEmployee(newValue.id)
            setCurrentEmployeeId(newValue.id)
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />

          {transactions !== null && currentEmployeeId === '' && paginatedTransactions?.nextPage !== null && (
            <button
              className="RampButton"
              disabled={isTransactionLoading}
              onClick={async () => {
                if (currentEmployeeId === '') {
                  await loadAllTransactions()
                }
                else {
                  await loadTransactionsByEmployee(currentEmployeeId)
                }

              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
