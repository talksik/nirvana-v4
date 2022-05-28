import { Avatar, AvatarGroup, SxProps } from '@mui/material';
import React from 'react';

/**
 *
 * for multiple avatars, will render all in a folder
 * takes into account size as well
 */
export default function NirvanaAvatar({
  avatars,
  size = 'default',
}: {
  size?: 'large' | 'small' | 'default';
  avatars: { src: string; alt: string }[];
}) {
  const sx: SxProps = size === 'small' ? { height: 25, width: 25 } : {};

  if (avatars?.length === 1) {
    return <Avatar alt={avatars[0].alt} src={avatars[0].src} sx={sx} />;
  }

  return (
    <AvatarGroup>
      {avatars.map((avatar, index) => (
        <Avatar key={`${avatar.alt}-${index}`} alt={avatar.alt} sx={sx} src={avatar.src} />
      ))}
    </AvatarGroup>
  );
}
