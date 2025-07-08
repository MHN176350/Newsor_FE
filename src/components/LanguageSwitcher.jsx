import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dropdown, 
  MenuButton, 
  Menu, 
  MenuItem, 
  Button,
  ListItemDecorator,
  Typography 
} from '@mui/joy';
import { Language as LanguageIcon } from '@mui/icons-material';

const languages = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English'
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    flag: '🇻🇳',
    nativeName: 'Tiếng Việt'
  }
];

export default function LanguageSwitcher({ variant = 'soft', size = 'sm' }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setOpen(false);
  };

  return (
    <Dropdown open={open} onOpenChange={(event, isOpen) => setOpen(isOpen)}>
      <MenuButton
        variant={variant}
        size={size}
        startDecorator={<LanguageIcon />}
        endDecorator={currentLanguage.flag}
        sx={{
          minWidth: 'auto',
          '--Button-gap': '0.5rem',
        }}
      >
        {currentLanguage.code.toUpperCase()}
      </MenuButton>
      <Menu
        variant="outlined"
        placement="bottom-end"
        sx={{
          minWidth: 160,
          '--List-padding': '0.5rem',
          '--ListItem-paddingY': '0.75rem',
        }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={language.code === i18n.language}
            sx={{
              '&:hover': {
                backgroundColor: 'var(--joy-palette-background-level2)',
              },
            }}
          >
            <ListItemDecorator sx={{ fontSize: '1.2em' }}>
              {language.flag}
            </ListItemDecorator>
            <div>
              <Typography level="body-sm" fontWeight="md">
                {language.nativeName}
              </Typography>
              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                {language.name}
              </Typography>
            </div>
          </MenuItem>
        ))}
      </Menu>
    </Dropdown>
  );
}
