import { Dropdown, MenuItem } from 'react-bootstrap'
import { User } from '../../../../../../types/group-management/user'
import ControlledDropdown from '../../../../shared/components/controlled-dropdown'
import { useTranslation } from 'react-i18next'
import MenuItemButton from '../../../project-list/components/dropdown/menu-item-button'

type ManagedUserDropdownButtonProps = {
  user: User
  openOffboardingModalForUser: (user: User) => void
}

export default function ManagedUserDropdownButton({
  user,
  openOffboardingModalForUser,
}: ManagedUserDropdownButtonProps) {
  const { t } = useTranslation()

  const onDeleteUserClick = () => {
    openOffboardingModalForUser(user)
  }

  return (
    <>
      <ControlledDropdown id={`managed-user-dropdown-${user._id}`}>
        <Dropdown.Toggle
          bsStyle={null}
          className="btn btn-link action-btn"
          noCaret
        >
          <i
            className="fa fa-ellipsis-v"
            aria-hidden="true"
            aria-label={t('actions')}
          />
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu-right">
          {user.enrollment ? (
            <MenuItemButton
              className="delete-user-action"
              onClick={onDeleteUserClick}
            >
              {t('delete_user')}
            </MenuItemButton>
          ) : (
            <MenuItem className="no-actions-available">
              <span className="text-muted">{t('no_actions')}</span>
            </MenuItem>
          )}
        </Dropdown.Menu>
      </ControlledDropdown>
    </>
  )
}
