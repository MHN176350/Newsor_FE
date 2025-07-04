import { Box, IconButton, Badge, Menu, MenuItem, Typography, Divider, Button, Stack } from '@mui/joy';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { Notifications as NotificationsIcon, MarkEmailRead } from '@mui/icons-material';
import { GET_UNREAD_NOTIFICATIONS, NOTIFICATION_SUBSCRIPTION } from '../graphql/queries';
import { MARK_NOTIFICATION_AS_READ, MARK_ALL_NOTIFICATIONS_AS_READ } from '../graphql/mutations';
import { formatDate } from '../utils/constants';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/presentation/hooks/useAuth';

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Fetch unread notifications
  const { data: notificationsData, loading, refetch } = useQuery(GET_UNREAD_NOTIFICATIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !isAuthenticated,
  });

  // Real-time subscription for new notifications
  const { data: subscriptionData } = useSubscription(NOTIFICATION_SUBSCRIPTION, {
    skip: !isAuthenticated,
    onData: ({ data }) => {
      if (data?.data?.notificationAdded) {
        // Refetch notifications when new one arrives
        refetch();
      }
    },
  });

  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ, {
    refetchQueries: [{ query: GET_UNREAD_NOTIFICATIONS }],
    awaitRefetchQueries: true,
  });

  const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ, {
    refetchQueries: [{ query: GET_UNREAD_NOTIFICATIONS }],
    awaitRefetchQueries: true,
  });

  const notifications = notificationsData?.unreadNotifications || [];
  const notificationCount = notifications.length;

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    // Optimistically navigate and close while mutation runs in the background
    navigate(`/review/article/${notification.article.slug}`);
    handleClose();
    try {
      markAsRead({
        variables: { notificationId: parseInt
          (notification.id) },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      handleClose();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'article_submitted':
        return '📝';
      case 'article_approved':
        return '✅';
      case 'article_rejected':
        return '❌';
      case 'article_published':
        return '🚀';
      default:
        return '📢';
    }
  };

  return (
    <>
      <IconButton
        variant="plain"
        color="neutral"
        onClick={handleClick}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={notificationCount} color="danger" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        placement="bottom-end"
        sx={{
          minWidth: 350,
          maxWidth: 400,
          p: 1
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1 }}>
          <Typography level="title-md">Notifications</Typography>
          {notifications.length > 0 && (
            <Button
              size="sm"
              variant="plain"
              startDecorator={<MarkEmailRead />}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </Stack>
        <Divider />

        {loading && !notifications.length && (
          <MenuItem>
            <Typography>Loading...</Typography>
          </MenuItem>
        )}

        {!loading && notifications.length === 0 && (
          <MenuItem>
            <Typography>No unread notifications</Typography>
          </MenuItem>
        )}

        {notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', whiteSpace: 'normal', my: 0.5 }}
          >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography>{getNotificationIcon(notification.notificationType)}</Typography>
                <Box>
                  <Typography level="body-sm" sx={{ wordBreak: 'break-word' }}>
                    {notification.message}
                  </Typography>
                  <Typography level="body-xs">{formatDate(notification.createdAt)}</Typography>
                </Box>
              </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
