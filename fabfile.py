from fabric.operations import local as lrun
from fabric.operations import run
from fabric.context_managers import settings
from fabric.api import env, task, sudo, prompt, cd, put, puts
from fab_config import Config

env.hosts = Config.hosts
server_settings_file = Config.server_settings_file


#####
#
# setup environment
#
#####
@task
def local():
    env.run = lrun
    env.hosts = ['localhost']
    env.project_dir = Config.local_project_dir
    env.username = Config.local_username
    env.password = Config.local_password


@task
def testing():
    env.run = run
    env.hosts = ['tstest.net']
    env.project_dir = Config.test_project_dir
    env.username = Config.testing_username
    env.password = Config.testing_password


@task
def prod():
    env.run = run
    env.hosts = ['tradeschool.coop']
    env.project_dir = Config.productino_project_dir
    env.username = Config.production_username
    env.password = Config.production_password


#####
#
# tasks that will need to be done repeatedly.
#
#####
@task
def update_sourcecode():
    with cd(env.project_dir):
        sudo('git pull', user=env.username)


@task
def update_project_settings():
    filename = prompt(
        'Enter name of local settings file:',
        default=server_settings_file
    )
    destination = '%s/ff/settings/server.py' % env.project_dir
    put(filename, destination, use_sudo=True)
    sudo('chown %s:webdev %s' % (env.username, destination))


@task
def run_buildout():
    with cd(env.project_dir):
        sudo('./bin/buildout -v -c server.cfg', user=env.username)


@task
def update_db():
    with cd(env.project_dir):
        sudo('./bin/django syncdb', user=env.username)
        sudo('./bin/django migrate', user=env.username)


@task
def update_static_files():
    # run the django command to update static files
    with cd(env.project_dir):
        sudo('./bin/django collectstatic', user=env.username)


@task
def load_fixtures():
    # load fixtures
    with cd(env.project_dir):
        sudo('./bin/django loaddata ###', user=env.username)


@task
def restart_memcached():
    with cd('/etc/init.d/memcached'):
        sudo('restart')


@task
def restart_apache():
    with cd(env.project_dir):
        sudo('../apache/bin/restart', user=env.username)


@task
def restart():
    #restart_memcached()
    restart_apache()


@task
def test():
    with cd(env.project_dir):
        sudo('./bin/django test futures -v 2', user=env.username)


@task
def update_and_test():
    update_sourcecode()

    restart()

    #test()


@task
def deploy():
    update_sourcecode()

    update = prompt(
        'Do you want to update the server settings file '
        'with a local file? (y/n)',
        default='y',
        validate=r'^[yYnN]$'
    )
    if update.upper() == 'Y':
        update_project_settings()

    update = prompt(
        'Do you want to re-run the buildout? (y/n)',
        default='y',
        validate=r'^[yYnN]$'
    )
    if update.upper() == 'Y':
        run_buildout()

    update_db()
    load_fixtures()
    update_static_files()
    restart()
    #test()


#####
#
# tasks that would need to be done once for a given server.
#
#####

@task
def init_os_package_setup():
    sudo('apt-get -y update')
    sudo('apt-get -y upgrade')
    sudo('apt-get install git python-dev')
    sudo('apt-get install mysql-server mysql-client libmysqlclient-dev')
    sudo('apt-get install apache2 libapache2-mod-wsgi')
    sudo('apt-get install gettext memcached')


@task
def init_project_sourcecode():
    sudo('mkdir --parents %s' % env.project_dir)
    sudo('chown %s:webdev %s' % env.username, env.project_dir)
    with cd(env.project_dir):
        sudo(
            'git clone git@github.com:orzubalsky/fantastic-futures.git .',
            user=env.username
        )


@task
def init_buildout():
    with cd(env.project_dir):
        sudo('python bootstrap.py -v 2.1.1 -c server.cfg', user=env.username)


@task
def create_cache_folder():
    with cd(env.project_dir):
        sudo('mkdir tmp', user=env.username)


@task
def initialize_everything():
    init_project_sourcecode()
    update_project_settings()
    init_buildout()

    run_buildout()
    update_db()

    restart


#####
#
# setup local machine
#
#####
@task
def setup():

    # sync database
    update_db()

    # load data fixtures
